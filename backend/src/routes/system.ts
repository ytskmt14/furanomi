import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireSystemAdmin } from '../middleware/auth';

const router = express.Router();

// 店舗管理者一覧取得（システム管理者のみ）
router.get('/shop-managers', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const result = await db.query(`
    SELECT 
      sm.id, sm.username, sm.email, sm.first_name, sm.last_name, 
      sm.phone, sm.is_active, sm.last_login_at, sm.created_at,
      s.id as shop_id, s.name as shop_name
    FROM shop_managers sm
    LEFT JOIN shops s ON sm.id = s.shop_manager_id
    ORDER BY sm.created_at DESC
  `);

  res.json(result.rows);
}));

// 店舗管理者作成（システム管理者のみ）
router.post('/shop-managers', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName, phone } = req.body;

  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Required fields: username, email, password, firstName, lastName' });
  }

  // パスワードのハッシュ化
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query(`
    INSERT INTO shop_managers (username, email, password_hash, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, email, first_name, last_name, phone, is_active, created_at
  `, [username, email, passwordHash, firstName, lastName, phone]);

  res.status(201).json(result.rows[0]);
}));

router.put('/shop-managers/:id', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password, first_name, last_name, phone, is_active } = req.body;

  if (!username || !email || !first_name || !last_name) {
    return res.status(400).json({ error: '必須フィールドが不足しています' });
  }

  // パスワードが提供された場合とそうでない場合でクエリを分ける
  if (password) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await db.query(`
      UPDATE shop_managers 
      SET username = $1, email = $2, password_hash = $3, first_name = $4, last_name = $5, phone = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, username, email, first_name, last_name, phone, is_active, updated_at
    `, [username, email, passwordHash, first_name, last_name, phone, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '店舗管理者が見つかりません' });
    }

    res.json(result.rows[0]);
  } else {
    const result = await db.query(`
      UPDATE shop_managers 
      SET username = $1, email = $2, first_name = $3, last_name = $4, phone = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, username, email, first_name, last_name, phone, is_active, updated_at
    `, [username, email, first_name, last_name, phone, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '店舗管理者が見つかりません' });
    }

    res.json(result.rows[0]);
  }
}));

// 店舗管理者削除（システム管理者のみ）
router.delete('/shop-managers/:id', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await db.query('DELETE FROM shop_managers WHERE id = $1 RETURNING *', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Shop manager not found' });
  }

  res.json({ message: 'Shop manager deleted successfully' });
}));

// システム設定取得（システム管理者のみ）
router.get('/settings', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const result = await db.query('SELECT * FROM system_settings ORDER BY key');
  res.json(result.rows);
}));

// システム設定更新（システム管理者のみ）
router.put('/settings', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { settings } = req.body;

  if (!Array.isArray(settings)) {
    return res.status(400).json({ error: 'Settings must be an array' });
  }

  const results = [];
  for (const setting of settings) {
    const { key, value, description } = setting;
    
    const result = await db.query(`
      INSERT INTO system_settings (key, value, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, value, description]);
    
    results.push(result.rows[0]);
  }

  res.json(results);
}));

// 店舗管理者管理（システム管理者のみ）
router.get('/shop-managers', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const result = await db.query(`
    SELECT 
      sm.id,
      sm.username,
      sm.email,
      sm.first_name,
      sm.last_name,
      sm.phone,
      sm.is_active,
      sm.last_login_at,
      sm.created_at,
      s.id as shop_id,
      s.name as shop_name
    FROM shop_managers sm
    LEFT JOIN shops s ON sm.id = s.shop_manager_id
    ORDER BY sm.created_at DESC
  `);

  res.json(result.rows);
}));

router.post('/shop-managers', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, first_name, last_name, phone, is_active = true } = req.body;

  if (!username || !email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: '必須フィールドが不足しています' });
  }

  // パスワードをハッシュ化
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query(`
    INSERT INTO shop_managers (username, email, password_hash, first_name, last_name, phone, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, username, email, first_name, last_name, phone, is_active, created_at
  `, [username, email, passwordHash, first_name, last_name, phone, is_active]);

  res.status(201).json(result.rows[0]);
}));

router.put('/shop-managers/:id', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password, first_name, last_name, phone, is_active } = req.body;

  if (!username || !email || !first_name || !last_name) {
    return res.status(400).json({ error: '必須フィールドが不足しています' });
  }

  // パスワードが提供された場合とそうでない場合でクエリを分ける
  if (password) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await db.query(`
      UPDATE shop_managers 
      SET username = $1, email = $2, password_hash = $3, first_name = $4, last_name = $5, phone = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, username, email, first_name, last_name, phone, is_active, updated_at
    `, [username, email, passwordHash, first_name, last_name, phone, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '店舗管理者が見つかりません' });
    }

    res.json(result.rows[0]);
  } else {
    const result = await db.query(`
      UPDATE shop_managers 
      SET username = $1, email = $2, first_name = $3, last_name = $4, phone = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, username, email, first_name, last_name, phone, is_active, updated_at
    `, [username, email, first_name, last_name, phone, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '店舗管理者が見つかりません' });
    }

    res.json(result.rows[0]);
  }
}));

router.delete('/shop-managers/:id', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 店舗管理者が店舗に紐付いている場合は削除できない
  const shopCheck = await db.query('SELECT id FROM shops WHERE shop_manager_id = $1', [id]);
  if (shopCheck.rows.length > 0) {
    return res.status(400).json({ error: '店舗に紐付いている管理者は削除できません' });
  }

  const result = await db.query('DELETE FROM shop_managers WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: '店舗管理者が見つかりません' });
  }

  res.status(204).send();
}));

// ダッシュボード統計情報（システム管理者のみ）
router.get('/dashboard/stats', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  // 店舗数
  const shopCount = await db.query('SELECT COUNT(*) as count FROM shops WHERE is_active = true');
  
  // 店舗管理者数
  const managerCount = await db.query('SELECT COUNT(*) as count FROM shop_managers WHERE is_active = true');
  
  // アクティブな店舗数（空き状況が更新されている店舗）
  const activeShopCount = await db.query(`
    SELECT COUNT(DISTINCT s.id) as count
    FROM shops s
    JOIN shop_availability sa ON s.id = sa.shop_id
    WHERE s.is_active = true
  `);
  
  // 最近追加された店舗
  const recentShops = await db.query(`
    SELECT id, name, address, category, created_at
    FROM shops 
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 5
  `);

  res.json({
    totalShops: parseInt(shopCount.rows[0].count),
    totalManagers: parseInt(managerCount.rows[0].count),
    activeShops: parseInt(activeShopCount.rows[0].count),
    recentShops: recentShops.rows
  });
}));

export { router as systemRoutes };
