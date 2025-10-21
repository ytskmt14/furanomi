-- ふらのみ 初期データ投入スクリプト
-- 開発・テスト用のサンプルデータ

-- システム設定の初期データ
INSERT INTO system_settings (key, value, description) VALUES
('search_radius_km', '5', 'デフォルト検索半径（キロメートル）'),
('max_search_results', '50', '最大検索結果数'),
('app_name', 'ふらのみ', 'アプリケーション名'),
('app_version', '1.0.0', 'アプリケーションバージョン')
ON CONFLICT (key) DO NOTHING;

-- システム管理者の初期データ
INSERT INTO system_admins (username, email, password_hash, first_name, last_name) VALUES
('admin', 'admin@furanomi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9KzKz2K', 'システム', '管理者')
ON CONFLICT (username) DO NOTHING;
-- パスワード: admin123

-- 店舗管理者の初期データ
INSERT INTO shop_managers (username, email, password_hash, first_name, last_name, phone) VALUES
('manager1', 'manager1@furanomi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9KzKz2K', '田中', '太郎', '090-1234-5678'),
('manager2', 'manager2@furanomi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9KzKz2K', '佐藤', '花子', '090-2345-6789')
ON CONFLICT (username) DO NOTHING;
-- パスワード: password

-- 店舗の初期データ
INSERT INTO shops (name, description, address, phone, email, category, latitude, longitude, business_hours, image_url, shop_manager_id) VALUES
(
  '居酒屋 ふらのみ',
  '新鮮な海鮮と地酒が自慢の居酒屋です。個室も完備しており、接待や宴会にもご利用いただけます。',
  '北海道富良野市朝日町1-2-3',
  '0167-23-4567',
  'info@furanomi.com',
  'izakaya',
  43.3457,
  142.3833,
  '{"monday": {"open": "17:00", "close": "23:00"}, "tuesday": {"open": "17:00", "close": "23:00"}, "wednesday": {"open": "17:00", "close": "23:00"}, "thursday": {"open": "17:00", "close": "23:00"}, "friday": {"open": "17:00", "close": "24:00"}, "saturday": {"open": "17:00", "close": "24:00"}, "sunday": {"open": "17:00", "close": "22:00"}}',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager1')
),
(
  'カフェ ラベンダー',
  '富良野のラベンダーをテーマにしたカフェです。自家製のラベンダーケーキとコーヒーをお楽しみください。',
  '北海道富良野市上富良野町4-5-6',
  '0167-45-6789',
  'info@lavender-cafe.com',
  'cafe',
  43.4567,
  142.4833,
  '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "19:00"}, "saturday": {"open": "09:00", "close": "19:00"}, "sunday": {"open": "09:00", "close": "17:00"}}',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager2')
),
(
  'レストラン トマト',
  '富良野産のトマトをふんだんに使用したイタリアンレストランです。',
  '北海道富良野市下富良野町7-8-9',
  '0167-67-8901',
  'info@tomato-restaurant.com',
  'restaurant',
  43.2345,
  142.2833,
  '{"monday": {"open": "11:30", "close": "21:00"}, "tuesday": {"open": "11:30", "close": "21:00"}, "wednesday": {"open": "11:30", "close": "21:00"}, "thursday": {"open": "11:30", "close": "21:00"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "11:30", "close": "20:00"}}',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager1')
);

-- 空き状況の初期データ
INSERT INTO shop_availability (shop_id, status, updated_at) VALUES
((SELECT id FROM shops WHERE name = '居酒屋 ふらのみ'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = 'カフェ ラベンダー'), 'busy', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = 'レストラン トマト'), 'closed', CURRENT_TIMESTAMP);

-- 店舗画像の初期データ
INSERT INTO shop_images (shop_id, image_url, is_primary) VALUES
((SELECT id FROM shops WHERE name = '居酒屋 ふらのみ'), 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = '居酒屋 ふらのみ'), 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop', false),
((SELECT id FROM shops WHERE name = 'カフェ ラベンダー'), 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = 'レストラン トマト'), 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', true);