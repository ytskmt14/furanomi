-- 福岡県福岡市東区香椎周辺のサンプルデータ
-- 実行日時: 2025-10-19

-- 既存データをクリア
DELETE FROM shop_availability;
DELETE FROM shops;
DELETE FROM shop_managers;
DELETE FROM system_admins;

-- システム管理者データ
INSERT INTO system_admins (id, username, email, password_hash, first_name, last_name, is_active, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@furanomi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2O', 'システム', '管理者', true, CURRENT_TIMESTAMP);

-- 店舗管理者データ
INSERT INTO shop_managers (id, username, email, password_hash, first_name, last_name, phone, is_active, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'manager1', 'manager1@furanomi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2O', '田中', '太郎', '090-1234-5678', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333333', 'manager2', 'manager2@furanomi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2O', '佐藤', '花子', '090-2345-6789', true, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444444', 'manager3', 'manager3@furanomi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2O', '山田', '次郎', '090-3456-7890', true, CURRENT_TIMESTAMP);

-- 店舗データ（福岡県福岡市東区香椎周辺）
INSERT INTO shops (id, name, description, address, phone, email, category, latitude, longitude, business_hours, image_url, is_active, shop_manager_id, created_at) VALUES
-- 居酒屋 ふらのみ（香椎駅前）
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '居酒屋 ふらのみ', '新鮮な海鮮と地酒が自慢の居酒屋です。個室も完備しており、接待や宴会にもご利用いただけます。', '福岡県福岡市東区香椎駅前1-2-3', '092-123-4567', 'info@furanomi.com', 'izakaya', 33.6594, 130.4444, '{"monday": {"open": "17:00", "close": "23:00"}, "tuesday": {"open": "17:00", "close": "23:00"}, "wednesday": {"open": "17:00", "close": "23:00"}, "thursday": {"open": "17:00", "close": "23:00"}, "friday": {"open": "17:00", "close": "24:00"}, "saturday": {"open": "17:00", "close": "24:00"}, "sunday": {"open": "17:00", "close": "22:00"}}', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', true, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP),

-- カフェ 香椎（香椎宮近く）
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'カフェ 香椎', '香椎宮の近くにある落ち着いたカフェです。自家焙煎のコーヒーと手作りケーキが自慢です。', '福岡県福岡市東区香椎宮前2-3-4', '092-234-5678', 'info@kashii-cafe.com', 'cafe', 33.6612, 130.4456, '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "21:00"}, "saturday": {"open": "08:00", "close": "21:00"}, "sunday": {"open": "08:00", "close": "20:00"}}', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop', true, '33333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP),

-- レストラン 香椎（香椎浜）
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'レストラン 香椎', '香椎浜の海の幸を活かしたイタリアンレストランです。地元の食材を使用した料理をお楽しみください。', '福岡県福岡市東区香椎浜3-4-5', '092-345-6789', 'info@kashii-restaurant.com', 'restaurant', 33.6578, 130.4422, '{"monday": {"open": "11:30", "close": "21:00"}, "tuesday": {"open": "11:30", "close": "21:00"}, "wednesday": {"open": "11:30", "close": "21:00"}, "thursday": {"open": "11:30", "close": "21:00"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "11:30", "close": "20:00"}}', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', true, '44444444-4444-4444-4444-444444444444', CURRENT_TIMESTAMP);

-- 空き状況データ
INSERT INTO shop_availability (id, shop_id, status, updated_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'available', CURRENT_TIMESTAMP),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'busy', CURRENT_TIMESTAMP),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'closed', CURRENT_TIMESTAMP);
