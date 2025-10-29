import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import webpush from 'web-push';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT Payload型定義
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// VAPID設定（環境変数から取得）
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:furanomi@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// ヘルパー関数: トークンからshop_manager_id取得
const getShopManagerIdFromToken = (req: Request): string | null => {
  const token = req.cookies.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temp-development-secret') as JWTPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// VAPID公開鍵を取得
router.get('/vapid-public-key', asyncHandler(async (req: Request, res: Response) => {
  if (!vapidKeys.publicKey) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }
  
  res.json({ publicKey: vapidKeys.publicKey });
}));

// プッシュ通知を購読
router.post('/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const shopManagerId = getShopManagerIdFromToken(req);
  
  if (!shopManagerId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { endpoint, keys } = req.body;

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    // 既存の購読があるか確認
    const existingResult = await db.query(
      'SELECT id FROM push_subscriptions WHERE shop_manager_id = $1',
      [shopManagerId]
    );

    if (existingResult.rows.length > 0) {
      // 既存の購読を更新
      await db.query(
        'UPDATE push_subscriptions SET endpoint = $1, p256dh = $2, auth = $3 WHERE shop_manager_id = $4',
        [endpoint, keys.p256dh, keys.auth, shopManagerId]
      );
    } else {
      // 新規購読を追加
      await db.query(
        'INSERT INTO push_subscriptions (shop_manager_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4)',
        [shopManagerId, endpoint, keys.p256dh, keys.auth]
      );
    }

    res.json({ message: 'Subscription saved successfully' });
  } catch (error: any) {
    console.error('Failed to save subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}));

// プッシュ通知の購読を解除
router.post('/unsubscribe', asyncHandler(async (req: Request, res: Response) => {
  const shopManagerId = getShopManagerIdFromToken(req);
  
  if (!shopManagerId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    await db.query(
      'DELETE FROM push_subscriptions WHERE shop_manager_id = $1',
      [shopManagerId]
    );

    res.json({ message: 'Subscription removed successfully' });
  } catch (error: any) {
    console.error('Failed to remove subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
}));

export { router as notificationRoutes };

