import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireShopManager, requireSystemAdmin } from '../middleware/auth';

const router = express.Router();

// Haversine formula で距離を計算（メートル単位）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 地球の半径（メートル）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 店舗一覧取得（認証不要）
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { category, status, lat, lng, radius } = req.query;

  let query = `
    SELECT 
      s.id, s.name, s.description, s.address, s.phone, s.email, 
      s.category, s.latitude, s.longitude, s.business_hours, 
      s.image_url, s.is_active, s.created_at, s.updated_at,
      sa.status as availability_status, sa.updated_at as availability_updated_at,
      sm.id as shop_manager_id, sm.username as shop_manager_username,
      sm.first_name as shop_manager_first_name, sm.last_name as shop_manager_last_name
    FROM shops s
    LEFT JOIN shop_availability sa ON s.id = sa.shop_id
    LEFT JOIN shop_managers sm ON s.shop_manager_id = sm.id
    WHERE s.is_active = true
  `;

  const params: any[] = [];
  let paramCount = 1;

  // 検索半径の決定（システム設定から取得、デフォルト1000m）
  let searchRadius = 1000; // デフォルト1km
  if (radius) {
    searchRadius = parseFloat(radius as string) * 1000; // kmをmに変換
  } else {
    // システム設定から検索半径を取得
    try {
      const settingsResult = await db.query(
        'SELECT value FROM system_settings WHERE key = $1',
        ['search_radius']
      );
      if (settingsResult.rows.length > 0) {
        searchRadius = parseFloat(settingsResult.rows[0].value);
      }
    } catch (error) {
      console.warn('Failed to fetch search radius from settings, using default:', error);
    }
  }

  // カテゴリフィルタ
  if (category) {
    query += ` AND s.category = $${paramCount}`;
    params.push(category);
    paramCount++;
  }

  // 空き状況フィルタ
  if (status) {
    query += ` AND sa.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  // 位置情報フィルタ（Haversine formula - メートル単位）
  if (lat && lng) {
    query += ` AND (
      6371000 * acos(
        cos(radians($${paramCount})) * cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians($${paramCount + 1})) + 
        sin(radians($${paramCount})) * sin(radians(s.latitude))
      )
    ) <= $${paramCount + 2}`;
    params.push(parseFloat(lat as string), parseFloat(lng as string), searchRadius);
    paramCount += 3;
  }

  // 営業時間外を最後に、それ以外は距離または名前でソート
  if (lat && lng) {
    query += ` ORDER BY 
      CASE WHEN sa.status = 'closed' THEN 1 ELSE 0 END ASC,
      (
        6371000 * acos(
          cos(radians($${paramCount})) * cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians($${paramCount + 1})) + 
          sin(radians($${paramCount})) * sin(radians(s.latitude))
        )
      ) ASC`;
    params.push(parseFloat(lat as string), parseFloat(lng as string));
    paramCount += 2;
  } else {
    query += ` ORDER BY 
      CASE WHEN sa.status = 'closed' THEN 1 ELSE 0 END ASC,
      s.name ASC`;
  }

  const result = await db.query(query, params);
  
  // 営業時間に基づく自動判定関数
  const isWithinBusinessHours = (businessHours: any) => {
    if (!businessHours || typeof businessHours !== 'object') {
      return true; // 営業時間が設定されていない場合は営業中とみなす
    }

    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[now.getDay()];
    const todayHours = businessHours[todayName];

    // 今日の営業時間をチェック
    if (todayHours && todayHours.open && todayHours.close) {
      const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM形式
      const openTime = parseInt(todayHours.open.replace(':', ''));
      const closeTime = parseInt(todayHours.close.replace(':', ''));

      let isTodayOpen = false;
      if (todayHours.close_next_day) {
        // 翌日まで営業の場合（例：17:00 - 04:00）
        isTodayOpen = currentTime >= openTime || currentTime < closeTime;
      } else {
        // 同日営業の場合（例：08:00 - 20:00）
        isTodayOpen = currentTime >= openTime && currentTime < closeTime;
      }

      // 今日の営業時間内の場合は true を返す
      if (isTodayOpen) {
        return true;
      }
    }

    // 今日の営業時間外の場合、前日の営業時間をチェック
    const yesterdayIndex = (now.getDay() - 1 + 7) % 7; // 前日のインデックス
    const yesterdayName = dayNames[yesterdayIndex];
    const yesterdayHours = businessHours[yesterdayName];

    if (yesterdayHours && yesterdayHours.open && yesterdayHours.close && yesterdayHours.close_next_day) {
      // 前日が翌日まで営業の場合（例：月曜 17:00 - 火曜 04:00）
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = parseInt(yesterdayHours.open.replace(':', ''));
      const closeTime = parseInt(yesterdayHours.close.replace(':', ''));
      
      // 前日の営業開始時刻以降 OR 前日の営業終了時刻（翌日の時刻）未満
      return currentTime >= openTime || currentTime < closeTime;
    }

    return false; // 営業時間外
  };

  // 結果を整形して店舗管理者の情報と距離を含める
  const formattedShops = result.rows.map(row => {
    // 営業時間に基づいて自動判定
    const isOpen = isWithinBusinessHours(row.business_hours);
    const finalAvailabilityStatus = isOpen ? row.availability_status : 'closed';

    const shop = {
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      phone: row.phone,
      email: row.email,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      business_hours: row.business_hours,
      image_url: row.image_url,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      availability_status: finalAvailabilityStatus,
      availability_updated_at: row.availability_updated_at,
      shop_manager: row.shop_manager_id ? {
        id: row.shop_manager_id,
        username: row.shop_manager_username,
        first_name: row.shop_manager_first_name,
        last_name: row.shop_manager_last_name
      } : null
    };

    // 位置情報が提供された場合は距離を計算
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const distance = calculateDistance(userLat, userLng, row.latitude, row.longitude);
      return {
        ...shop,
        distance: Math.round(distance) // メートル単位で四捨五入
      };
    }

    return shop;
  });

  // 営業時間外を最後に、それ以外は距離または名前でソート（営業時間自動判定後）
  const sortedShops = formattedShops.sort((a, b) => {
    // 営業時間外の店舗を最後に
    if (a.availability_status === 'closed' && b.availability_status !== 'closed') {
      return 1;
    }
    if (a.availability_status !== 'closed' && b.availability_status === 'closed') {
      return -1;
    }
    
    // 位置情報が提供された場合は距離でソート
    if (lat && lng && (a as any).distance && (b as any).distance) {
      return (a as any).distance - (b as any).distance;
    }
    
    // それ以外は名前でソート
    return a.name.localeCompare(b.name);
  });
  
  // レスポンス形式を統一
  if (sortedShops.length === 0) {
    res.json({
      shops: [],
      total: 0,
      message: "No shops found within the specified radius"
    });
  } else {
    res.json({
      shops: sortedShops,
      total: sortedShops.length,
      message: "Shops retrieved successfully"
    });
  }
}));

// 店舗管理者の自分の店舗情報取得
router.get('/my-shop', authenticateToken, requireShopManager, asyncHandler(async (req: Request, res: Response) => {
  const managerId = req.user!.id;

  const result = await db.query(`
    SELECT 
      s.id, s.name, s.description, s.address, s.phone, s.email, 
      s.category, s.latitude, s.longitude, s.business_hours, s.image_url,
      s.is_active, s.created_at, s.updated_at,
      sa.status as availability_status, sa.updated_at as availability_updated_at
    FROM shops s
    LEFT JOIN shop_availability sa ON s.id = sa.shop_id
    WHERE s.shop_manager_id = $1 AND s.is_active = true
    ORDER BY s.updated_at DESC
    LIMIT 1
  `, [managerId]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found for this manager' });
  }

  res.json(result.rows[0]);
}));

// 店舗詳細取得（認証不要）
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      s.id, s.name, s.description, s.address, s.phone, s.email, 
      s.category, s.latitude, s.longitude, s.business_hours, 
      s.image_url, s.is_active, s.created_at, s.updated_at,
      sa.status as availability_status, sa.updated_at as availability_updated_at
    FROM shops s
    LEFT JOIN shop_availability sa ON s.id = sa.shop_id
    WHERE s.id = $1 AND s.is_active = true
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  res.json(result.rows[0]);
}));

// 店舗情報更新（店舗管理者のみ）
router.put('/:id', authenticateToken, requireShopManager, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, address, phone, email, category, business_hours, image_url } = req.body;

  // 店舗が自分のものかチェック
  const shopCheck = await db.query(
    'SELECT shop_manager_id FROM shops WHERE id = $1',
    [id]
  );

  if (shopCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  if (shopCheck.rows[0].shop_manager_id !== req.user!.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const result = await db.query(`
    UPDATE shops 
    SET 
      name = $1, description = $2, address = $3, phone = $4, 
      email = $5, category = $6, business_hours = $7, image_url = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `, [name, description, address, phone, email, category, business_hours, image_url, id]);

  res.json(result.rows[0]);
}));

// 店舗作成（システム管理者のみ）
router.post('/', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { 
    name, description, address, phone, email, category, 
    latitude, longitude, business_hours, image_url, shop_manager_id 
  } = req.body;

  const result = await db.query(`
    INSERT INTO shops (
      name, description, address, phone, email, category,
      latitude, longitude, business_hours, image_url, shop_manager_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [name, description, address, phone, email, category, latitude, longitude, business_hours, image_url, shop_manager_id]);

  res.status(201).json(result.rows[0]);
}));

// 店舗削除（システム管理者のみ）
router.delete('/:id', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await db.query('DELETE FROM shops WHERE id = $1 RETURNING *', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  res.json({ message: 'Shop deleted successfully' });
}));

export { router as shopRoutes };
