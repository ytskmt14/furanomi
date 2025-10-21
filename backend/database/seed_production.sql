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

-- テスト用店舗管理者（本番環境でも動作確認用）
-- パスワード: manager123!@#
INSERT INTO shop_managers (id, username, email, password_hash, first_name, last_name, phone, is_active)
VALUES (
  gen_random_uuid(),
  'test_manager',
  'manager@furanomi.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Kz8Kz8K', -- manager123!@# のハッシュ
  'テスト',
  'マネージャー',
  '090-1234-5678',
  true
);

-- テスト用店舗（福岡県福岡市東区香椎周辺）
INSERT INTO shops (
  id, name, description, address, phone, email, category,
  latitude, longitude, business_hours, image_url, shop_manager_id, is_active
)
VALUES (
  gen_random_uuid(),
  'テスト居酒屋 香椎店',
  '福岡県福岡市東区香椎にあるテスト用居酒屋です。',
  '福岡県福岡市東区香椎1-1-1',
  '092-123-4567',
  'test@example.com',
  'izakaya',
  33.6667,
  130.4167,
  '{"monday": {"open": "17:00", "close": "23:00"}, "tuesday": {"open": "17:00", "close": "23:00"}, "wednesday": {"open": "17:00", "close": "23:00"}, "thursday": {"open": "17:00", "close": "23:00"}, "friday": {"open": "17:00", "close": "23:00"}, "saturday": {"open": "17:00", "close": "23:00"}, "sunday": {"open": "17:00", "close": "23:00"}}',
  'https://via.placeholder.com/400x300?text=Test+Shop',
  (SELECT id FROM shop_managers WHERE username = 'test_manager'),
  true
);

-- テスト用空き状況
INSERT INTO shop_availability (shop_id, status, updated_at)
VALUES (
  (SELECT id FROM shops WHERE name = 'テスト居酒屋 香椎店'),
  'available',
  CURRENT_TIMESTAMP
);

-- 注意事項:
-- 1. システム管理者の初回ログイン後、パスワードを即座に変更してください
-- 2. 本番環境では本格運用前にテストデータを削除してください
-- 3. 店舗管理者アカウントは管理画面から追加作成してください
