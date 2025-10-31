import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireSystemAdmin } from '../middleware/auth';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const router = express.Router();

// Google Maps Geocoding API
const GEOCODING_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';


// 郵便番号から住所を検索（zipcloud API使用）
router.get('/postal-code/:code', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;
  
  // ハイフンを削除
  const cleanCode = code.replace(/-/g, '');
  
  if (!/^\d{7}$/.test(cleanCode)) {
    return res.status(400).json({ error: '無効な郵便番号です' });
  }
  
  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanCode}`);
    const data = await response.json() as any;
    
    if (data.status === 200 && data.results) {
      const results = data.results.map((result: any) => ({
        postalCode: `${cleanCode.slice(0, 3)}-${cleanCode.slice(3)}`,
        prefecture: result.address1,
        city: result.address2,
        town: result.address3,
        prefectureKana: result.kana1,
        cityKana: result.kana2,
        townKana: result.kana3
      }));
      
      res.json({ results });
    } else {
      res.status(404).json({ error: '該当する住所が見つかりませんでした' });
    }
  } catch (error) {
    console.error('郵便番号検索エラー:', error);
    res.status(500).json({ error: '郵便番号検索に失敗しました' });
  }
}));

// 住所から位置情報を取得（プロキシ経由）
// Google Maps Geocoding APIへのプロキシエンドポイント
// フロントエンドにAPIキーを露出させないためのセキュリティ対策
router.post('/geocode', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: '住所が指定されていません' });
  }

  if (!GEOCODING_API_KEY) {
    return res.status(500).json({ error: 'Google Maps API キーが設定されていません' });
  }

  try {
    // サーバーサイドでGoogle Maps Geocoding APIを呼び出し
    // APIキーをサーバーサイドで管理し、フロントエンドからは隠蔽
    const response = await fetch(`${GEOCODING_API_URL}?address=${encodeURIComponent(address)}&key=${GEOCODING_API_KEY}&language=ja`);
    const data = await response.json() as any;

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      res.json({
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id
      });
    } else {
      console.error('Geocoding failed:', data.status, data.error_message);
      res.status(404).json({ 
        error: '住所が見つかりませんでした',
        details: data.status === 'ZERO_RESULTS' ? '該当する住所が見つかりません' : data.error_message || 'Geocoding API エラー'
      });
    }
  } catch (error) {
    console.error('Geocoding API エラー:', error);
    res.status(500).json({ error: '位置情報の取得に失敗しました' });
  }
}));

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
  const { username, email, password, firstName, lastName, phone, is_active } = req.body;

  if (!username || !email || !firstName || !lastName) {
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
    `, [username, email, passwordHash, firstName, lastName, phone, is_active, id]);

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
    `, [username, email, firstName, lastName, phone, is_active, id]);

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
  const { username, email, password, firstName, lastName, phone, is_active = true } = req.body;

  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: '必須フィールドが不足しています' });
  }

  // パスワードをハッシュ化
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query(`
    INSERT INTO shop_managers (username, email, password_hash, first_name, last_name, phone, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, username, email, first_name, last_name, phone, is_active, created_at
  `, [username, email, passwordHash, firstName, lastName, phone, is_active]);

  res.status(201).json(result.rows[0]);
}));

router.put('/shop-managers/:id', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password, firstName, lastName, phone, is_active } = req.body;

  if (!username || !email || !firstName || !lastName) {
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
    `, [username, email, passwordHash, firstName, lastName, phone, is_active, id]);

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
    `, [username, email, firstName, lastName, phone, is_active, id]);

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
  
  // 拡張機能の利用状況（ONの件数を機能別に集計）
  const featuresUsage = await db.query(`
    SELECT feature_name, COUNT(*) AS enabled_count
    FROM shop_feature_settings
    WHERE enabled = true
    GROUP BY feature_name
    ORDER BY feature_name ASC
  `);

  res.json({
    totalShops: parseInt(shopCount.rows[0].count),
    totalManagers: parseInt(managerCount.rows[0].count),
    activeShops: parseInt(activeShopCount.rows[0].count),
    featuresUsage: featuresUsage.rows
  });
}));

export { router as systemRoutes };
