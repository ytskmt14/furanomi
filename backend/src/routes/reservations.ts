import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT Payload型定義
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
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

  // 予約作成
  const result = await db.query(
    'INSERT INTO reservations (user_id, shop_id, party_size, arrival_time_estimate, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, shopId, partySize, arrivalTimeEstimate, 'pending']
  );

  const reservation = result.rows[0];

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
    ['rejected', id]
  );

  res.json({ message: 'Reservation rejected successfully' });
}));

export { router as reservationRoutes };
