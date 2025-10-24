-- パフォーマンス最適化用インデックス追加
-- TASK-012: バックエンドAPIレスポンス最適化

-- 位置情報検索用のインデックス（最も重要）
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);

-- JOIN最適化用のインデックス
CREATE INDEX IF NOT EXISTS idx_shop_availability_shop_id ON shop_availability(shop_id);
CREATE INDEX IF NOT EXISTS idx_shops_shop_manager_id ON shops(shop_manager_id);

-- アクティブ店舗フィルタ用のインデックス
CREATE INDEX IF NOT EXISTS idx_shops_is_active ON shops(is_active) WHERE is_active = true;

-- 複合インデックス（カテゴリフィルタ用）
CREATE INDEX IF NOT EXISTS idx_shops_category_active ON shops(category, is_active);

-- システム設定検索用のインデックス
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- インデックス作成完了のログ
DO $$
BEGIN
    RAISE NOTICE 'Performance indexes created successfully for TASK-012';
END $$;
