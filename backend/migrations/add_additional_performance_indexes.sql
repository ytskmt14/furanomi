-- 追加パフォーマンス最適化用インデックス
-- Phase 3: PostgreSQL Configuration Optimization

-- 複合インデックス（距離 + ステータスフィルタ用）
CREATE INDEX IF NOT EXISTS idx_shops_location_active 
ON shops(latitude, longitude, is_active) 
WHERE is_active = true;

-- カテゴリ + アクティブ状態の複合インデックス
CREATE INDEX IF NOT EXISTS idx_shops_category_active_composite 
ON shops(category, is_active) 
WHERE is_active = true;

-- 空き状況テーブルの更新日時インデックス（リアルタイムデータ取得用）
CREATE INDEX IF NOT EXISTS idx_shop_availability_updated_at 
ON shop_availability(updated_at DESC);

-- 店舗の更新日時インデックス（最新店舗取得用）
CREATE INDEX IF NOT EXISTS idx_shops_updated_at 
ON shops(updated_at DESC) 
WHERE is_active = true;

-- 部分インデックス（営業時間が設定されている店舗のみ）
CREATE INDEX IF NOT EXISTS idx_shops_with_business_hours 
ON shops(id) 
WHERE business_hours IS NOT NULL AND business_hours != '{}';

-- インデックス作成完了のログ
DO $$
BEGIN
    RAISE NOTICE 'Additional performance indexes created successfully for Phase 3 optimization';
END $$;
