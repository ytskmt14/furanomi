-- 住所情報管理のベストプラクティス実装用マイグレーション
-- shopsテーブルに郵便番号、正規化住所、place_id、geocoding実行日時を追加

ALTER TABLE shops 
ADD COLUMN postal_code VARCHAR(8),
ADD COLUMN formatted_address VARCHAR(500),
ADD COLUMN place_id VARCHAR(255),
ADD COLUMN geocoded_at TIMESTAMP WITH TIME ZONE;

-- インデックスの作成
CREATE INDEX idx_shops_postal_code ON shops(postal_code);
CREATE INDEX idx_shops_place_id ON shops(place_id);

-- コメントの追加
COMMENT ON COLUMN shops.postal_code IS '郵便番号（xxx-xxxx形式）';
COMMENT ON COLUMN shops.formatted_address IS 'Google Maps Geocoding APIから取得した正規化住所';
COMMENT ON COLUMN shops.place_id IS 'Google Maps Place ID（住所の一意識別子）';
COMMENT ON COLUMN shops.geocoded_at IS 'Geocoding実行日時';
