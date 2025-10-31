import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUserToken } from '../middleware/auth';

const router = express.Router();

// VAPID公開鍵（利用者向け）
router.get('/vapid-public-key', asyncHandler(async (req: Request, res: Response) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: 'VAPID public key not configured' });
  }
  res.json({ publicKey });
}));

// プッシュ通知の購読登録（利用者）
router.post('/subscribe', authenticateUserToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { endpoint, p256dh, auth } = req.body;

  if (!endpoint || !p256dh || !auth) {
    return res.status(400).json({ error: 'Subscription data is incomplete' });
  }

  await db.query(
    `INSERT INTO user_push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET
       user_id = $1, p256dh = $3, auth = $4, created_at = NOW()`,
    [userId, endpoint, p256dh, auth]
  );

  res.status(201).json({ message: 'Subscription successful' });
}));

// プッシュ通知の購読解除（利用者）
router.post('/unsubscribe', authenticateUserToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  // 実運用ではendpoint指定での解除が望ましいが、ここではユーザー全購読を解除
  await db.query('DELETE FROM user_push_subscriptions WHERE user_id = $1', [userId]);
  res.json({ message: 'Unsubscription successful' });
}));

export { router as userNotificationRoutes };


