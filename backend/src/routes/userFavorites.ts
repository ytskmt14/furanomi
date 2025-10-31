import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUserToken } from '../middleware/auth';

const router = express.Router();

// 取得: 自分のお気に入り一覧（shop_id配列を返す）
router.get('/', authenticateUserToken, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: 'User role required' });
  }
  const userId = req.user!.id;
  const result = await db.query(
    'SELECT shop_id FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  const shopIds = result.rows.map(r => r.shop_id);
  res.json({ favorites: shopIds });
}));

// 追加: /:shopId
router.post('/:shopId', authenticateUserToken, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: 'User role required' });
  }
  const userId = req.user!.id;
  const { shopId } = req.params;

  // ショップ存在確認（存在しないIDへの登録を防止）
  const shop = await db.query('SELECT id FROM shops WHERE id = $1', [shopId]);
  if (shop.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  await db.query(
    `INSERT INTO user_favorites (user_id, shop_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, shop_id) DO NOTHING`,
    [userId, shopId]
  );

  res.status(201).json({ message: 'Added to favorites' });
}));

// 解除: /:shopId
router.delete('/:shopId', authenticateUserToken, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: 'User role required' });
  }
  const userId = req.user!.id;
  const { shopId } = req.params;

  await db.query('DELETE FROM user_favorites WHERE user_id = $1 AND shop_id = $2', [userId, shopId]);
  res.json({ message: 'Removed from favorites' });
}));

export { router as userFavoritesRoutes };


