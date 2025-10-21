-- マイグレーション: shopsテーブルにshop_manager_idのユニーク制約を追加
-- 実行日時: 2025-10-19

-- 既存の重複データをクリーンアップ（最新の店舗を残す）
WITH ranked_shops AS (
    SELECT id, shop_manager_id, created_at,
           ROW_NUMBER() OVER (PARTITION BY shop_manager_id ORDER BY created_at DESC) as rn
    FROM shops
    WHERE shop_manager_id IS NOT NULL
)
UPDATE shops 
SET shop_manager_id = NULL 
WHERE id IN (
    SELECT id FROM ranked_shops WHERE rn > 1
);

-- shop_manager_idにユニーク制約を追加
ALTER TABLE shops ADD CONSTRAINT shops_shop_manager_id_unique UNIQUE (shop_manager_id);
