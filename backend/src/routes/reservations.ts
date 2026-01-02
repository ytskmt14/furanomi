import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import webpush from 'web-push';
import { isFeatureEnabled } from './shopFeatures';

const router = express.Router();

// JWT Payload型定義
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// ヘルパー関数: 店舗管理者へ予約通知を送信
async function sendReservationNotificationToShopManager(
  shopId: string,
  shopName: string,
  partySize: number,
  arrivalTimeEstimate: string
) {
  // VAPIDキーの設定確認
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notification');
    return;
  }

  // VAPID設定
  webpush.setVapidDetails(
    'mailto:furanomi@example.com',
    vapidPublicKey,
    vapidPrivateKey
  );

  // 予約機能が有効かチェック（予約機能が無効な店舗には通知を送信しない）
  const reservationEnabled = await isFeatureEnabled(shopId, 'reservation');
  if (!reservationEnabled) {
    console.log(`Reservation feature is disabled for shop ${shopId}, skipping notification`);
    return;
  }

  // 店舗のshop_manager_idを取得
  const shopResult = await db.query(
    'SELECT shop_manager_id FROM shops WHERE id = $1',
    [shopId]
  );

  if (shopResult.rows.length === 0 || !shopResult.rows[0].shop_manager_id) {
    console.warn(`No shop manager found for shop ${shopId}`);
    return;
  }

  const shopManagerId = shopResult.rows[0].shop_manager_id;

  // shop_manager_idのプッシュ購読を取得
  const subscriptionResult = await db.query(
    'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE shop_manager_id = $1',
    [shopManagerId]
  );

  if (subscriptionResult.rows.length === 0) {
    console.log(`No push subscription found for shop manager ${shopManagerId}`);
    return;
  }

  // 到着時間の表示用テキスト
  const arrivalText = arrivalTimeEstimate === '15min' ? '15分以内' : 
                     arrivalTimeEstimate === '30min' ? '30分以内' : '1時間以内';

  // 通知メッセージを送信
  const subscription = {
    endpoint: subscriptionResult.rows[0].endpoint,
    keys: {
      p256dh: subscriptionResult.rows[0].p256dh,
      auth: subscriptionResult.rows[0].auth
    }
  };

  const payload = JSON.stringify({
    title: '新規予約',
    body: `${shopName}: ${partySize}名 / ${arrivalText}`,
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: {
      url: `/shop-manager/reservations`
    }
  });

  await webpush.sendNotification(subscription, payload);
  console.log(`Push notification sent to shop manager ${shopManagerId}`);
}

// ヘルパー関数: トークンからユーザーID取得
const getUserIdFromToken = (req: Request): string | null => {
  const token = req.cookies.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temp-development-secret') as JWTPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// 予約作成
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  console.log('Reservation request received:', {
    hasUserId: !!userId,
    userId: userId,
    body: req.body
  });
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { shopId, partySize, arrivalTimeEstimate } = req.body;

  // バリデーション
  if (!shopId || !partySize || !arrivalTimeEstimate) {
    return res.status(400).json({ error: 'shopId, partySize, and arrivalTimeEstimate are required' });
  }

  if (!['15min', '30min', '1hour'].includes(arrivalTimeEstimate)) {
    return res.status(400).json({ error: 'arrivalTimeEstimate must be 15min, 30min, or 1hour' });
  }

  if (partySize < 1 || partySize > 20) {
    return res.status(400).json({ error: 'partySize must be between 1 and 20' });
  }

  // 店舗の存在確認
  const shopResult = await db.query('SELECT id, name FROM shops WHERE id = $1', [shopId]);
  if (shopResult.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  // 予約機能が有効かチェック
  const reservationEnabled = await isFeatureEnabled(shopId, 'reservation');
  if (!reservationEnabled) {
    return res.status(403).json({ error: 'Reservation feature is not enabled for this shop' });
  }

  // 予約作成
  const result = await db.query(
    'INSERT INTO reservations (user_id, shop_id, party_size, arrival_time_estimate, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, shopId, partySize, arrivalTimeEstimate, 'pending']
  );

  const reservation = result.rows[0];

  // 店舗管理者へプッシュ通知を送信
  try {
    await sendReservationNotificationToShopManager(
      shopId,
      shopResult.rows[0].name,
      partySize,
      arrivalTimeEstimate
    );
  } catch (notificationError) {
    // 通知送信失敗は無視（予約作成は成功とする）
    console.error('Failed to send push notification:', notificationError);
  }

  res.status(201).json({
    message: 'Reservation created successfully',
    reservation: {
      id: reservation.id,
      shopId: reservation.shop_id,
      shopName: shopResult.rows[0].name,
      partySize: reservation.party_size,
      arrivalTimeEstimate: reservation.arrival_time_estimate,
      status: reservation.status,
      createdAt: reservation.created_at
    }
  });
}));

// 自分の予約一覧取得
router.get('/my', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await db.query(
    `SELECT r.*, s.name as shop_name, s.address as shop_address, s.phone as shop_phone
     FROM reservations r
     JOIN shops s ON r.shop_id = s.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );

  res.json({
    reservations: result.rows.map(row => ({
      id: row.id,
      shopId: row.shop_id,
      shopName: row.shop_name,
      shopAddress: row.shop_address,
      shopPhone: row.shop_phone,
      partySize: row.party_size,
      arrivalTimeEstimate: row.arrival_time_estimate,
      status: row.status,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  });
}));

// 予約詳細取得
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;

  const result = await db.query(
    `SELECT r.*, s.name as shop_name, s.address as shop_address, s.phone as shop_phone
     FROM reservations r
     JOIN shops s ON r.shop_id = s.id
     WHERE r.id = $1 AND r.user_id = $2`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const row = result.rows[0];
  res.json({
    reservation: {
      id: row.id,
      shopId: row.shop_id,
      shopName: row.shop_name,
      shopAddress: row.shop_address,
      shopPhone: row.shop_phone,
      partySize: row.party_size,
      arrivalTimeEstimate: row.arrival_time_estimate,
      status: row.status,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  });
}));

// 予約キャンセル
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;

  // 予約の存在と所有権を確認
  const checkResult = await db.query(
    'SELECT id, status FROM reservations WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  // ステータスを更新（物理削除ではなく論理削除）
  await db.query(
    'UPDATE reservations SET status = $1 WHERE id = $2',
    ['cancelled', id]
  );

  res.json({ message: 'Reservation cancelled successfully' });
}));

// 店舗の予約一覧取得（店舗管理者用）
router.get('/shop/:shopId', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { shopId } = req.params;

  // 店舗管理者か確認
  const shopResult = await db.query(
    'SELECT shop_manager_id FROM shops WHERE id = $1',
    [shopId]
  );

  if (shopResult.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  // TODO: 認証ロジックをmiddlewareで実装（今回は簡易的にチェック）
  // 実際の実装では、JWTからroleを取得してshop_managerか確認

  const result = await db.query(
    `SELECT r.*, u.name as user_name, u.email as user_email
     FROM reservations r
     JOIN users u ON r.user_id = u.id
     WHERE r.shop_id = $1
     ORDER BY r.created_at DESC`,
    [shopId]
  );

  res.json({
    reservations: result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      partySize: row.party_size,
      arrivalTimeEstimate: row.arrival_time_estimate,
      status: row.status,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  });
}));

// 予約承認（店舗管理者用）
router.put('/:id/approve', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;

  // 予約の存在確認
  const checkResult = await db.query(
    'SELECT id, status FROM reservations WHERE id = $1',
    [id]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  // ステータスを更新
  await db.query(
    'UPDATE reservations SET status = $1 WHERE id = $2',
    ['approved', id]
  );

  res.json({ message: 'Reservation approved successfully' });
}));

// 予約拒否（店舗管理者用）
router.put('/:id/reject', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const { rejectionReason } = req.body;

  // 予約の存在確認
  const checkResult = await db.query(
    'SELECT id, status FROM reservations WHERE id = $1',
    [id]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  // ステータスと理由を更新
  await db.query(
    'UPDATE reservations SET status = $1, rejection_reason = $2 WHERE id = $3',
    ['rejected', rejectionReason || null, id]
  );

  res.json({ message: 'Reservation rejected successfully' });
}));

export { router as reservationRoutes };
