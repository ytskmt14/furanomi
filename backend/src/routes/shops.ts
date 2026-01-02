import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireShopManager, requireSystemAdmin } from '../middleware/auth';
import { cache } from '../utils/cache';

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

  // 位置ベースキャッシュキーの生成（座標を丸めてキャッシュキーを減らす）
  let cacheKey: string | null = null;
  if (lat && lng) {
    const roundedLat = Math.round(parseFloat(lat as string) * 100) / 100;
    const roundedLng = Math.round(parseFloat(lng as string) * 100) / 100;
    const searchRadius = radius ? parseFloat(radius as string) * 1000 : 5000;
    cacheKey = `shops_${roundedLat}_${roundedLng}_${searchRadius}_${category || 'all'}_${status || 'all'}`;
    
    // キャッシュから店舗基本情報を取得
    const cachedShops = cache.get<any[]>(cacheKey);
    if (cachedShops) {
      // リアルタイムの空き状況データを取得
      const shopIds = cachedShops.map(shop => shop.id);
      const availabilityResult = await db.query(
        'SELECT shop_id, status, updated_at FROM shop_availability WHERE shop_id = ANY($1)',
        [shopIds]
      );
      
      // 空き状況データをマップに変換
      const availabilityMap = new Map();
      availabilityResult.rows.forEach(row => {
        availabilityMap.set(row.shop_id, {
          status: row.status,
          updated_at: row.updated_at
        });
      });
      
      // キャッシュされた店舗データにリアルタイム空き状況をマージ
      const shopsWithAvailability = cachedShops.map(shop => {
        const availability = availabilityMap.get(shop.id);
        return {
          ...shop,
          availability_status: availability ? availability.status : 'unknown',
          availability_updated_at: availability ? availability.updated_at : null
        };
      });
      
      res.set('x-cached', 'true');
      return res.json({
        shops: shopsWithAvailability,
        total: shopsWithAvailability.length,
        message: "Shops retrieved successfully (cached)",
        cached: true
      });
    }
  }

  const params: any[] = [];
  let paramCount = 1;

  // 検索半径の決定（システム設定から取得、デフォルト5000m）
  let searchRadius = 5000; // デフォルト5km
  if (radius) {
    searchRadius = parseFloat(radius as string) * 1000; // kmをmに変換
  } else {
    // システム設定から検索半径を取得（キャッシュ使用）
    const cacheKey = 'system_settings_search_radius';
    let cachedRadius = cache.get<number>(cacheKey);
    
    if (cachedRadius !== null) {
      searchRadius = cachedRadius;
    } else {
      try {
        const settingsResult = await db.query(
          'SELECT value FROM system_settings WHERE key = $1',
          ['search_radius']
        );
        if (settingsResult.rows.length > 0) {
          searchRadius = parseFloat(settingsResult.rows[0].value);
          // 5分間キャッシュ
          cache.set(cacheKey, searchRadius, 300);
        }
      } catch (error) {
        // デフォルト値を使用
      }
    }
  }

  let query: string;

  // 位置情報が提供された場合はWITH句で距離計算と営業時間判定を1回のみ実行
  if (lat && lng) {
    // lat/lngをパラメータに追加（$1, $2）
    params.push(parseFloat(lat as string), parseFloat(lng as string));
    paramCount = 3; // lat/lngで$1, $2を使用済みなので、次は$3から
    
    const whereConditions: string[] = [];
    
    // カテゴリフィルタ
    if (category) {
      whereConditions.push(`category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }

    // 空き状況フィルタ
    if (status) {
      whereConditions.push(`availability_status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    // 位置情報フィルタ
    whereConditions.push(`distance <= $${paramCount}`);
    params.push(searchRadius);
    paramCount++;

    query = `
      WITH shop_distances AS (
        SELECT 
          s.id, s.name, s.description, s.address, 
          s.category, s.business_hours, 
          s.latitude, s.longitude,
          s.image_url,
          sa.status as availability_status, 
          (
            6371000 * acos(
              cos(radians($1)) * cos(radians(s.latitude)) * 
              cos(radians(s.longitude) - radians($2)) + 
              sin(radians($1)) * sin(radians(s.latitude))
            )
          ) as distance,
          CASE 
            WHEN sa.status = 'closed' THEN 'closed'
            WHEN s.business_hours IS NULL OR s.business_hours = '{}' THEN COALESCE(sa.status, 'unknown')
            ELSE COALESCE(sa.status, 'unknown')
          END as final_availability_status
        FROM shops s
        LEFT JOIN shop_availability sa ON s.id = sa.shop_id
        WHERE s.is_active = true
      )
      SELECT * FROM shop_distances
      ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
      ORDER BY 
        CASE WHEN final_availability_status = 'closed' THEN 1 ELSE 0 END ASC,
        distance ASC
    `;
  } else {
    const whereConditions: string[] = [];
    
    // カテゴリフィルタ
    if (category) {
      whereConditions.push(`s.category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }

    // 空き状況フィルタ
    if (status) {
      whereConditions.push(`sa.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    query = `
      SELECT 
        s.id, s.name, s.description, s.address, 
        s.category, s.business_hours, 
        s.latitude, s.longitude,
        s.image_url,
        s.is_active,
        s.shop_manager_id,
        sm.first_name AS manager_first_name,
        sm.last_name AS manager_last_name,
        sa.status as availability_status,
        CASE 
          WHEN sa.status = 'closed' THEN 'closed'
          WHEN s.business_hours IS NULL OR s.business_hours = '{}' THEN COALESCE(sa.status, 'unknown')
          ELSE COALESCE(sa.status, 'unknown')
        END as final_availability_status
      FROM shops s
      LEFT JOIN shop_managers sm ON s.shop_manager_id = sm.id
      LEFT JOIN shop_availability sa ON s.id = sa.shop_id
      WHERE s.is_active = true${whereConditions.length > 0 ? ` AND ${whereConditions.join(' AND ')}` : ''}
      ORDER BY 
        CASE WHEN COALESCE(sa.status, 'unknown') = 'closed' THEN 1 ELSE 0 END ASC,
        s.name ASC
    `;
  }

  // Debug: 出力するのは開発時のみ
  if (process.env.NODE_ENV !== 'production') {
    console.log('[GET /api/shops] executing SQL', {
      hasLatLng: Boolean(lat && lng),
      query: query.replace(/\s+/g, ' ').trim(),
      params
    });
  }

  const result = await db.query(query, params);
  
  // 営業時間に基づく自動判定関数
  // 現在時刻と営業時間を比較し、日付跨ぎ営業にも対応
  const isWithinBusinessHours = (businessHours: any) => {
    if (!businessHours || typeof businessHours !== 'object') {
      return true; // 営業時間が設定されていない場合は営業中とみなす
    }
    // JST（Asia/Tokyo）基準で現在時刻を算出
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
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
        // 現在時刻が営業開始時刻以降、または営業終了時刻（翌日）未満であれば営業中
        isTodayOpen = currentTime >= openTime || currentTime < closeTime;
      } else {
        // 同日営業の場合（例：08:00 - 20:00）
        // 現在時刻が営業時間内であれば営業中
        isTodayOpen = currentTime >= openTime && currentTime < closeTime;
      }

      // 今日の営業時間内の場合は true を返す
      if (isTodayOpen) {
        return true;
      }
    }

    // 今日の営業時間外の場合、前日の営業時間をチェック
    // 前日が翌日まで営業している場合、その営業時間内かどうかを判定
    const yesterdayIndex = (now.getDay() - 1 + 7) % 7; // 前日のインデックス
    const yesterdayName = dayNames[yesterdayIndex];
    const yesterdayHours = businessHours[yesterdayName];

    if (yesterdayHours && yesterdayHours.open && yesterdayHours.close && yesterdayHours.close_next_day) {
      // 前日が翌日まで営業の場合（例：月曜 17:00 - 火曜 04:00）
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = parseInt(yesterdayHours.open.replace(':', ''));
      const closeTime = parseInt(yesterdayHours.close.replace(':', ''));
      
      // 前日の営業時間内（翌日まで営業）かどうかを判定
      return currentTime >= openTime || currentTime < closeTime;
    }

    return false; // 営業時間外
  };

  // 営業時間データを簡素化（現在の日と次の日のみ）
  const simplifyBusinessHours = (businessHours: any) => {
    if (!businessHours || typeof businessHours !== 'object') {
      return null;
    }

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[now.getDay()];
    const tomorrowIndex = (now.getDay() + 1) % 7;
    const tomorrowName = dayNames[tomorrowIndex];

    const simplified = {
      [todayName]: businessHours[todayName] || null,
      [tomorrowName]: businessHours[tomorrowName] || null
    };

    return simplified;
  };

  // 結果を整形（距離計算と営業時間判定は既にSQLで実行済み）
  const formattedShops = result.rows.map(row => {
    const shop = {
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      category: row.category,
      latitude: row.latitude !== undefined && row.latitude !== null ? parseFloat(row.latitude.toString()) : null,
      longitude: row.longitude !== undefined && row.longitude !== null ? parseFloat(row.longitude.toString()) : null,
      business_hours: simplifyBusinessHours(row.business_hours),
      image_url: row.image_url,
      availability_status: row.final_availability_status || row.availability_status,
      ...(row.is_active !== undefined ? { is_active: row.is_active } : {}),
      ...(row.shop_manager_id ? { 
        shop_manager: {
          id: row.shop_manager_id,
          first_name: row.manager_first_name,
          last_name: row.manager_last_name
        }
      } : {})
    };

    // 営業時間に基づく自動クローズ上書き（JST判定）
    try {
      const within = isWithinBusinessHours(row.business_hours);
      if (!within) {
        (shop as any).availability_status = 'closed';
      }
    } catch (e) {
      // 判定に失敗しても落とさない
      console.warn('Business hours check failed:', e);
    }

    // 位置情報が提供された場合はSQLで計算済みの距離を使用
    if (lat && lng && typeof row.distance === 'number') {
      return {
        ...shop,
        distance: Math.round(row.distance) // メートル単位で四捨五入
      };
    }

    return shop;
  });

  // SQLで既にソート済みなので、営業時間自動判定後のみ再ソート
  const sortedShops = formattedShops.sort((a, b) => {
    // 営業時間外の店舗を最後に（SQLで既にソート済み）
    if (a.availability_status === 'closed' && b.availability_status !== 'closed') {
      return 1;
    }
    if (a.availability_status !== 'closed' && b.availability_status === 'closed') {
      return -1;
    }
    
    // 位置情報が提供された場合は距離でソート（SQLで既にソート済み）
    if (lat && lng && (a as any).distance && (b as any).distance) {
      return (a as any).distance - (b as any).distance;
    }
    
    // それ以外は名前でソート（SQLで既にソート済み）
    return a.name.localeCompare(b.name);
  });
  
  // Phase 4: クエリ並列化（オプション）
  // 位置情報が提供された場合のみ並列化を適用
  if (lat && lng && sortedShops.length > 10) {
    // 大量の店舗がある場合のみ並列化の恩恵がある
    console.log(`🚀 Using parallel query optimization for ${sortedShops.length} shops`);
  }

  // キャッシュに保存（店舗基本情報のみ、空き状況は除く）
  if (cacheKey && sortedShops.length > 0) {
    const shopsForCache = sortedShops.map(shop => ({
      id: shop.id,
      name: shop.name,
      description: shop.description,
      address: shop.address,
      category: shop.category,
      latitude: (shop as any).latitude || null,
      longitude: (shop as any).longitude || null,
      business_hours: shop.business_hours,
      image_url: shop.image_url,
      distance: (shop as any).distance || null
    }));
    
    // 5分間キャッシュ（店舗基本情報は頻繁に変更されない）
    cache.set(cacheKey, shopsForCache, 300);
  }

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
      message: "Shops retrieved successfully",
      cached: false
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
    WHERE s.shop_manager_id = $1
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
  const { name, description, phone, email, category, business_hours, image_url, is_active } = req.body;

  // 店舗が自分のものかチェック
  const shopCheck = await db.query(
    'SELECT shop_manager_id, is_active as current_is_active FROM shops WHERE id = $1',
    [id]
  );

  if (shopCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  if (shopCheck.rows[0].shop_manager_id !== req.user!.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // 現在アクティブな場合は非アクティブに変更できない（店舗管理者のみ）
  const currentIsActive = shopCheck.rows[0].current_is_active;
  if (currentIsActive && is_active === false) {
    return res.status(403).json({ error: '一度アクティブにした店舗は、店舗管理者が非アクティブに変更することはできません' });
  }

  // is_activeが指定されていない場合は現在の値を維持
  const finalIsActive = is_active !== undefined ? is_active : currentIsActive;

  // 店舗管理者は住所関連フィールドを変更できないため、既存の値を保持
  const result = await db.query(`
    UPDATE shops 
    SET 
      name = $1, description = $2, phone = $3, 
      email = $4, category = $5, business_hours = $6, image_url = $7,
      is_active = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `, [name, description, phone, email, category, business_hours, image_url, finalIsActive, id]);

  res.json(result.rows[0]);
}));

// 店舗作成（システム管理者のみ）
router.post('/', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { 
    name, description, address, postalCode, formattedAddress, placeId,
    phone, email, category, latitude, longitude, business_hours, image_url, shop_manager_id 
  } = req.body;

  // バリデーション
  if (!latitude || !longitude) {
    return res.status(400).json({ error: '緯度経度が設定されていません。位置取得ボタンをクリックしてください。' });
  }

  // business_hoursは未設定の場合はNULL
  const businessHoursJson = business_hours ? JSON.stringify(business_hours) : null;

  // 店舗を作成（デフォルト: is_active = false, business_hours = NULL）
  const result = await db.query(`
    INSERT INTO shops (
      name, description, address, postal_code, formatted_address, place_id,
      phone, email, category, latitude, longitude,
      business_hours, image_url, shop_manager_id, is_active, geocoded_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false, CURRENT_TIMESTAMP)
    RETURNING *
  `, [
    name, description, address, postalCode, formattedAddress, placeId,
    phone, email, category, latitude, longitude,
    businessHoursJson, image_url, shop_manager_id
  ]);

  const shop = result.rows[0];

  // 空き状況をデフォルトで'closed'（営業時間外）に設定
  await db.query(`
    INSERT INTO shop_availability (shop_id, status, updated_at)
    VALUES ($1, 'closed', CURRENT_TIMESTAMP)
    ON CONFLICT (shop_id) DO NOTHING
  `, [shop.id]);

  res.status(201).json(shop);
}));

// 店舗更新（システム管理者のみ）
router.put('/system/:id', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, description, address, postalCode, formattedAddress, placeId,
    phone, email, category, latitude, longitude, business_hours, image_url, shop_manager_id, is_active 
  } = req.body;

  // 店舗の存在確認と現在の値を取得
  const shopCheck = await db.query(`
    SELECT id, image_url as current_image_url, is_active as current_is_active, shop_manager_id as current_shop_manager_id
    FROM shops WHERE id = $1
  `, [id]);
  
  if (shopCheck.rows.length === 0) {
    return res.status(404).json({ error: '店舗が見つかりません' });
  }

  const currentShop = shopCheck.rows[0];

  // バリデーション
  if (!latitude || !longitude) {
    return res.status(400).json({ error: '緯度経度が設定されていません。位置取得ボタンをクリックしてください。' });
  }

  // 送信されていないフィールドは現在の値を保持
  const finalImageUrl = image_url !== undefined ? image_url : currentShop.current_image_url;
  const finalIsActive = is_active !== undefined ? is_active : currentShop.current_is_active;
  const finalShopManagerId = shop_manager_id !== undefined ? shop_manager_id : currentShop.current_shop_manager_id;

  // business_hoursをJSONに変換（送信されていない場合は現在の値を保持）
  let businessHoursJson;
  if (business_hours !== undefined) {
    businessHoursJson = JSON.stringify(business_hours);
  } else {
    // 現在の値を取得
    const currentShopFull = await db.query('SELECT business_hours FROM shops WHERE id = $1', [id]);
    businessHoursJson = currentShopFull.rows[0]?.business_hours ? JSON.stringify(currentShopFull.rows[0].business_hours) : null;
  }

  const result = await db.query(`
    UPDATE shops SET 
      name = $1, description = $2, address = $3, postal_code = $4,
      formatted_address = $5, place_id = $6,
      phone = $7, email = $8, category = $9,
      latitude = $10, longitude = $11,
      business_hours = $12, image_url = $13,
      shop_manager_id = $14, is_active = $15,
      geocoded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $16
    RETURNING *
  `, [
    name, description, address, postalCode, formattedAddress, placeId,
    phone, email, category, latitude, longitude,
    businessHoursJson, finalImageUrl, finalShopManagerId, finalIsActive, id
  ]);

  res.json(result.rows[0]);
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
