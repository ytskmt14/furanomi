-- ふらのみ 初期データ投入スクリプト
-- 福岡県福岡市東区香椎周辺の開発・テスト用サンプルデータ

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

-- 店舗管理者の初期データ（10店舗分）
INSERT INTO shop_managers (username, email, password_hash, first_name, last_name, phone) VALUES
('manager1', 'manager1@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '田中', '太郎', '092-1234-5678'),
('manager2', 'manager2@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '佐藤', '花子', '092-2345-6789'),
('manager3', 'manager3@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '鈴木', '一郎', '092-3456-7890'),
('manager4', 'manager4@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '山田', '二郎', '092-4567-8901'),
('manager5', 'manager5@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '伊藤', '三郎', '092-5678-9012'),
('manager6', 'manager6@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '加藤', '四郎', '092-6789-0123'),
('manager7', 'manager7@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '吉田', '五郎', '092-7890-1234'),
('manager8', 'manager8@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '高橋', '六郎', '092-8901-2345'),
('manager9', 'manager9@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '渡辺', '七郎', '092-9012-3456'),
('manager10', 'manager10@kashii.com', '$2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K', '中村', '八郎', '092-0123-4567')
ON CONFLICT (username) DO NOTHING;
-- パスワード: password0!（bcryptハッシュ: $2b$12$zQuXu9C5HpRkpmckHh6dTeBu2UAH8h7e74WxvaIb7KaDILkE3mk3K）

-- 店舗の初期データ（福岡県福岡市東区香椎周辺10店舗）
INSERT INTO shops (name, description, address, phone, email, category, latitude, longitude, business_hours, image_url, shop_manager_id) VALUES
(
  '居酒屋 香椎一番',
  '新鮮な魚介と地酒が自慢の居酒屋です。個室も完備しており、接待や宴会にもご利用いただけます。',
  '福岡県福岡市東区香椎1-1-1',
  '092-1234-5678',
  'info@kashii01.com',
  'izakaya',
  33.6536,
  130.4461,
  '{"monday": {"open": "17:00", "close": "23:00"}, "tuesday": {"open": "17:00", "close": "23:00"}, "wednesday": {"open": "17:00", "close": "23:00"}, "thursday": {"open": "17:00", "close": "23:00"}, "friday": {"open": "17:00", "close": "24:00"}, "saturday": {"open": "17:00", "close": "24:00"}, "sunday": {"open": "17:00", "close": "22:00"}}',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager1')
),
(
  'カフェ デリシャス',
  '手作りのケーキとコーヒーが自慢のカフェです。ゆっくりとお過ごしいただける空間をご提供します。',
  '福岡県福岡市東区香椎2-2-2',
  '092-2345-6789',
  'info@delicious-cafe.com',
  'cafe',
  33.6578,
  130.4483,
  '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "19:00"}, "saturday": {"open": "09:00", "close": "19:00"}, "sunday": {"open": "09:00", "close": "17:00"}}',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager2')
),
(
  'イタリアンレストラン ラ・ベラ',
  '本格的なイタリアンを手頃な価格で提供するレストランです。',
  '福岡県福岡市東区香椎3-3-3',
  '092-3456-7890',
  'info@labella-restaurant.com',
  'restaurant',
  33.6455,
  130.4442,
  '{"monday": {"open": "11:30", "close": "21:00"}, "tuesday": {"open": "11:30", "close": "21:00"}, "wednesday": {"open": "11:30", "close": "21:00"}, "thursday": {"open": "11:30", "close": "21:00"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "11:30", "close": "20:00"}}',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager3')
),
(
  '焼肉 鶴の家',
  '厳選された牛肉を提供する本格焼肉店です。個室も完備。',
  '福岡県福岡市東区香椎4-4-4',
  '092-4567-8901',
  'info@tsurunoya.com',
  'restaurant',
  33.6612,
  130.4505,
  '{"monday": {"open": "17:00", "close": "23:00"}, "tuesday": {"open": "17:00", "close": "23:00"}, "wednesday": {"open": "17:00", "close": "23:00"}, "thursday": {"open": "17:00", "close": "23:00"}, "friday": {"open": "17:00", "close": "24:00"}, "saturday": {"open": "17:00", "close": "24:00"}, "sunday": {"open": "17:00", "close": "22:00"}}',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager4')
),
(
  '寿司 海鮮太郎',
  '新鮮なネタをその場で握る本格的なお寿司店です。',
  '福岡県福岡市東区香椎5-5-5',
  '092-5678-9012',
  'info@sushitaisho.com',
  'restaurant',
  33.6498,
  130.4420,
  '{"monday": {"open": "11:30", "close": "22:00"}, "tuesday": {"open": "11:30", "close": "22:00"}, "wednesday": {"open": "17:00", "close": "22:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "17:00", "close": "21:00"}}',
  'https://images.unsplash.com/photo-1563612292-1bb1367b68e1?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager5')
),
(
  'ラーメン 九州味',
  '濃厚なスープとコシのある麺が自慢の九州ラーメン店です。',
  '福岡県福岡市東区香椎6-6-6',
  '092-6789-0123',
  'info@kyushuaji.com',
  'restaurant',
  33.6555,
  130.4496,
  '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "11:00", "close": "21:00"}}',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager6')
),
(
  '中華料理 福岡',
  '本格的な中華料理をリーズナブルな価格で提供します。',
  '福岡県福岡市東区香椎7-7-7',
  '092-7890-1234',
  'info@chuka-fukuoka.com',
  'restaurant',
  33.6433,
  130.4479,
  '{"monday": {"open": "11:30", "close": "21:00"}, "tuesday": {"open": "11:30", "close": "21:00"}, "wednesday": {"open": "11:30", "close": "21:00"}, "thursday": {"open": "11:30", "close": "21:00"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "11:30", "close": "20:00"}}',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager7')
),
(
  'パン屋 ふくちゃん',
  '焼きたてのパンが自慢のパン屋さんです。朝から販売しています。',
  '福岡県福岡市東区香椎8-8-8',
  '092-8901-2345',
  'info@fukunchan.com',
  'cafe',
  33.6590,
  130.4512,
  '{"monday": {"open": "07:00", "close": "18:00"}, "tuesday": {"open": "07:00", "close": "18:00"}, "wednesday": {"open": "07:00", "close": "18:00"}, "thursday": {"open": "07:00", "close": "18:00"}, "friday": {"open": "07:00", "close": "19:00"}, "saturday": {"open": "07:00", "close": "19:00"}, "sunday": {"open": "07:00", "close": "17:00"}}',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager8')
),
(
  'うどん さぬき',
  'コシのある手打ちうどんが自慢のお店です。',
  '福岡県福岡市東区香椎9-9-9',
  '092-9012-3456',
  'info@udon-sanuki.com',
  'restaurant',
  33.6477,
  130.4435,
  '{"monday": {"open": "11:00", "close": "21:00"}, "tuesday": {"open": "11:00", "close": "21:00"}, "wednesday": {"open": "11:00", "close": "21:00"}, "thursday": {"open": "11:00", "close": "21:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "11:00", "close": "20:00"}}',
  'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager9')
),
(
  '定食屋 さくら',
  '栄養バランスの取れた定食をリーズナブルな価格で提供します。',
  '福岡県福岡市東区香椎10-10-10',
  '092-0123-4567',
  'info@teishoku-sakura.com',
  'restaurant',
  33.6520,
  130.4457,
  '{"monday": {"open": "11:00", "close": "21:00"}, "tuesday": {"open": "11:00", "close": "21:00"}, "wednesday": {"open": "11:00", "close": "21:00"}, "thursday": {"open": "11:00", "close": "21:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "11:00", "close": "20:00"}}',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
  (SELECT id FROM shop_managers WHERE username = 'manager10')
);

-- 空き状況の初期データ（全店舗「空きあり」）
INSERT INTO shop_availability (shop_id, status, updated_at) VALUES
((SELECT id FROM shops WHERE name = '居酒屋 香椎一番'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = 'カフェ デリシャス'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = 'イタリアンレストラン ラ・ベラ'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = '焼肉 鶴の家'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = '寿司 海鮮太郎'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = 'ラーメン 九州味'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = '中華料理 福岡'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = 'パン屋 ふくちゃん'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = 'うどん さぬき'), 'available', CURRENT_TIMESTAMP),
((SELECT id FROM shops WHERE name = '定食屋 さくら'), 'available', CURRENT_TIMESTAMP);

-- 店舗画像の初期データ
INSERT INTO shop_images (shop_id, image_url, is_primary) VALUES
((SELECT id FROM shops WHERE name = '居酒屋 香椎一番'), 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = '居酒屋 香椎一番'), 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop', false),
((SELECT id FROM shops WHERE name = 'カフェ デリシャス'), 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = 'イタリアンレストラン ラ・ベラ'), 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = '焼肉 鶴の家'), 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = '寿司 海鮮太郎'), 'https://images.unsplash.com/photo-1563612292-1bb1367b68e1?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = 'ラーメン 九州味'), 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = '中華料理 福岡'), 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = 'パン屋 ふくちゃん'), 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = 'うどん さぬき'), 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=600&fit=crop', true),
((SELECT id FROM shops WHERE name = '定食屋 さくら'), 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop', true);
