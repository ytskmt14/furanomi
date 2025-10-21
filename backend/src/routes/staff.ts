import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// スタッフ用アクセストークンで店舗情報を取得
router.get('/shop/:token', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const result = await db.query(`
    SELECT 
      s.id, s.name, s.description, s.address, s.phone, s.email, 
      s.category, s.latitude, s.longitude, s.business_hours, s.image_url,
      s.is_active, s.created_at, s.updated_at,
      sa.status as availability_status, sa.updated_at as availability_updated_at
    FROM shops s
    LEFT JOIN shop_availability sa ON s.id = sa.shop_id
    WHERE s.staff_access_token = $1 AND s.is_active = true
  `, [token]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Invalid access token' });
  }

  res.json(result.rows[0]);
}));

// スタッフ用パスコード認証
router.post('/auth/:token', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { passcode } = req.body;

  if (!passcode || passcode.length !== 4) {
    return res.status(400).json({ error: 'Passcode must be 4 digits' });
  }

  const result = await db.query(`
    SELECT id, name, staff_passcode
    FROM shops 
    WHERE staff_access_token = $1 AND is_active = true
  `, [token]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Invalid access token' });
  }

  const shop = result.rows[0];
  
  if (shop.staff_passcode !== passcode) {
    return res.status(401).json({ error: 'Invalid passcode' });
  }

  res.json({ 
    success: true, 
    shop: { 
      id: shop.id, 
      name: shop.name 
    } 
  });
}));

// スタッフ用空き状況更新
router.put('/availability/:token', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { passcode, status } = req.body;

  if (!passcode || passcode.length !== 4) {
    return res.status(400).json({ error: 'Passcode must be 4 digits' });
  }

  if (!status || !['available', 'busy', 'full', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // 店舗の存在確認とパスコード認証
  const shopResult = await db.query(`
    SELECT id, staff_passcode
    FROM shops 
    WHERE staff_access_token = $1 AND is_active = true
  `, [token]);

  if (shopResult.rows.length === 0) {
    return res.status(404).json({ error: 'Invalid access token' });
  }

  const shop = shopResult.rows[0];
  
  if (shop.staff_passcode !== passcode) {
    return res.status(401).json({ error: 'Invalid passcode' });
  }

  // 空き状況を更新
  const updateResult = await db.query(`
    INSERT INTO shop_availability (shop_id, status, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (shop_id) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at
    RETURNING status, updated_at
  `, [shop.id, status]);

  res.json({
    success: true,
    status: updateResult.rows[0].status,
    updated_at: updateResult.rows[0].updated_at
  });
}));

// 店舗管理者用：スタッフ用アクセス情報取得
router.get('/access-info/:shopId', asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = req.params;

  const result = await db.query(`
    SELECT 
      staff_access_token, 
      staff_passcode, 
      staff_token_created_at
    FROM shops 
    WHERE id = $1 AND is_active = true
  `, [shopId]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  res.json(result.rows[0]);
}));

// 店舗管理者用：スタッフ用アクセス情報更新（トークン再発行、パスコード再生成）
router.put('/access-info/:shopId', asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = req.params;
  const { regenerateToken, regeneratePasscode } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (regenerateToken) {
    updates.push(`staff_access_token = $${paramCount}`);
    values.push(db.query('SELECT uuid_generate_v4() as uuid').then(r => r.rows[0].uuid));
    paramCount++;
  }

  if (regeneratePasscode) {
    updates.push(`staff_passcode = $${paramCount}`);
    values.push(Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
    paramCount++;
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates specified' });
  }

  // 非同期でUUIDを生成
  if (regenerateToken) {
    values[0] = await values[0];
  }

  updates.push(`staff_token_created_at = CURRENT_TIMESTAMP`);

  const query = `
    UPDATE shops 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount} AND is_active = true
    RETURNING staff_access_token, staff_passcode, staff_token_created_at
  `;
  values.push(shopId);

  const result = await db.query(query, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  res.json(result.rows[0]);
}));

export default router;
