-- マイグレーション: image_urlカラムのサイズを拡大
-- 実行日時: 2025-10-23

-- image_urlカラムをVARCHAR(500)からTEXTに変更
ALTER TABLE shops ALTER COLUMN image_url TYPE TEXT;

-- コメントの追加
COMMENT ON COLUMN shops.image_url IS '店舗画像URLまたはBase64エンコードされた画像データ';
