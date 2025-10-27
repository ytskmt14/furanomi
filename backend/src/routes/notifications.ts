import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import webpush from 'web-push';

const router = express.Router();

// VAPID設定（環境変数から取得）
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:furanomi@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// プッシュ通知購読登録
router.post('/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const { subscription, userId } = req.body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    // 購読情報をデータベースに保存
    const result = await db.query(`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      userId || null,
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth
    ]);

    res.json({
      success: true,
      message: 'Subscription saved'
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}));

// 購読解除
router.delete('/unsubscribe', asyncHandler(async (req: Request, res: Response) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint required' });
  }

  try {
    await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    
    res.json({
      success: true,
      message: 'Subscription removed'
    });
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
}));

// VAPID公開鍵取得
router.get('/vapid-public-key', asyncHandler(async (req: Request, res: Response) => {
  if (!vapidPublicKey) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }
  
  res.json({ publicKey: vapidPublicKey });
}));

export { router as notificationRoutes };

