-- マイグレーション: shopsテーブルにスタッフ用QRコード機能の列を追加
-- 実行日時: 2025-10-19

-- スタッフ用アクセストークン（UUID）
ALTER TABLE shops ADD COLUMN staff_access_token UUID DEFAULT uuid_generate_v4();

-- スタッフ用合言葉（4桁数字）
ALTER TABLE shops ADD COLUMN staff_passcode VARCHAR(4) DEFAULT NULL;

-- トークン作成日時
ALTER TABLE shops ADD COLUMN staff_token_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- スタッフ用アクセストークンにユニーク制約を追加
ALTER TABLE shops ADD CONSTRAINT shops_staff_access_token_unique UNIQUE (staff_access_token);

-- 既存の店舗にデフォルト値を設定
UPDATE shops SET 
  staff_access_token = uuid_generate_v4(),
  staff_passcode = LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  staff_token_created_at = CURRENT_TIMESTAMP
WHERE staff_access_token IS NULL;
