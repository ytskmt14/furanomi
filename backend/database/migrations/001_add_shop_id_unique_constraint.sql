-- マイグレーション: shop_availabilityテーブルにshop_idのユニーク制約を追加
-- 実行日時: 2025-10-19

-- shop_availabilityテーブルにshop_idのユニーク制約を追加
ALTER TABLE shop_availability ADD CONSTRAINT shop_availability_shop_id_unique UNIQUE (shop_id);

-- 既存の重複データがある場合は削除（最新のレコードを残す）
WITH ranked_availability AS (
    SELECT id, shop_id, status, updated_at,
           ROW_NUMBER() OVER (PARTITION BY shop_id ORDER BY updated_at DESC) as rn
    FROM shop_availability
)
DELETE FROM shop_availability 
WHERE id IN (
    SELECT id FROM ranked_availability WHERE rn > 1
);
