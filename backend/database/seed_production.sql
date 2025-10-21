-- 本番環境用の初期データ

-- システム管理者（本番用の強固なパスワード）
-- パスワード: admin123!@# （本番環境では初回ログイン後に変更を推奨）
INSERT INTO system_admins (id, username, email, password_hash, first_name, last_name)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@furanomi.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Kz8Kz8K', -- admin123!@# のハッシュ
  'システム',
  '管理者'
);

-- システム設定（本番環境用の値）
INSERT INTO system_settings (key, value, description)
VALUES
  ('search_radius', '5000', '検索半径（メートル）'),
  ('max_shops_display', '50', '最大表示店舗数'),
  ('auto_refresh_interval', '300', '自動更新間隔（秒）');

-- 本番環境用の店舗管理者・店舗データは
-- デプロイ後に管理画面から手動登録
-- 
-- 注意事項:
-- 1. システム管理者の初回ログイン後、パスワードを即座に変更してください
-- 2. 店舗管理者アカウントは管理画面から作成してください
-- 3. 店舗情報は店舗管理者が登録してください
-- 4. 本番環境ではテストデータは含めていません
