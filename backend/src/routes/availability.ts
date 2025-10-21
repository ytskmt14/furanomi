import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireShopManager } from '../middleware/auth';

const router = express.Router();

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
