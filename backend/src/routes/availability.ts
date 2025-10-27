import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireShopManager } from '../middleware/auth';
import webpush from 'web-push';

const router = express.Router();

// VAPID設定（環境変数から取得）
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:furanomi@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// プッシュ通知を送信するヘルパー関数
async function sendPushNotification(shopId: string, shopName: string, newStatus: string) {
  try {
    // 該当店舗を購読している全ユーザーを取得
    const subscriptions = await db.query(`
      SELECT endpoint, p256dh, auth
      FROM push_subscriptions
    `);

    if (subscriptions.rows.length === 0) {
      console.log('No subscriptions found');
      return;
    }

    // ステータス名を日本語に変換
    const statusLabels: { [key: string]: string } = {
      available: '空きあり',
      busy: '混雑中',
      full: '満席',
      closed: '閉店'
    };

    const payload = JSON.stringify({
      title: `${shopName}の空き状況が更新されました`,
      body: `現在の状況: ${statusLabels[newStatus] || newStatus}`,
      icon: '/icon-128x128.svg',
      badge: '/icon-128x128.svg',
      data: {
        url: `/user`,
        shopId: shopId
      }
    });

    // 各購読者に通知を送信
    const promises = subscriptions.rows.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        );
      } catch (error: any) {
        // 無効な購読は削除
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
          console.log(`Removed invalid subscription: ${sub.endpoint}`);
        } else {
          console.error('Error sending notification:', error);
        }
      }
    });

    await Promise.all(promises);
    console.log(`Push notification sent to ${subscriptions.rows.length} subscribers`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// 空き状況更新（店舗管理者のみ）
router.put('/:shopId', authenticateToken, requireShopManager, asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = req.params;
  const { status } = req.body;

  if (!status || !['available', 'busy', 'full', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be: available, busy, full, or closed' });
  }

  // 店舗が自分のものかチェック
  const shopCheck = await db.query(
    'SELECT shop_manager_id FROM shops WHERE id = $1',
    [shopId]
  );

  if (shopCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  if (shopCheck.rows[0].shop_manager_id !== req.user!.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // 店舗名を取得
  const shopNameResult = await db.query('SELECT name FROM shops WHERE id = $1', [shopId]);
  const shopName = shopNameResult.rows[0]?.name || '店舗';

  // 空き状況の更新（UPSERT）
  const result = await db.query(`
    INSERT INTO shop_availability (shop_id, status, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (shop_id) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `, [shopId, status]);

  // プッシュ通知を送信（非同期）
  sendPushNotification(shopId, shopName, status).catch(error => {
    console.error('Failed to send push notification:', error);
  });

  res.json({
    message: 'Availability updated successfully',
    availability: result.rows[0]
  });
}));

// 空き状況取得（認証不要）
router.get('/:shopId', asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = req.params;

  const result = await db.query(`
    SELECT sa.*, s.name as shop_name
    FROM shop_availability sa
    JOIN shops s ON sa.shop_id = s.id
    WHERE sa.shop_id = $1 AND s.is_active = true
  `, [shopId]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Availability not found' });
  }

  res.json(result.rows[0]);
}));

// 全店舗の空き状況取得（認証不要）
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;

  let query = `
    SELECT 
      sa.shop_id, sa.status, sa.updated_at,
      s.name as shop_name, s.address, s.phone, s.category
    FROM shop_availability sa
    JOIN shops s ON sa.shop_id = s.id
    WHERE s.is_active = true
  `;

  const params: any[] = [];
  if (status) {
    query += ' AND sa.status = $1';
    params.push(status);
  }

  query += ' ORDER BY sa.updated_at DESC';

  const result = await db.query(query, params);
  res.json(result.rows);
}));

export { router as availabilityRoutes };
