-- 予約テーブルにrejection_reasonカラムを追加
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

