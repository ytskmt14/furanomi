-- プッシュ通知購読テーブル
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- コメント
COMMENT ON TABLE push_subscriptions IS 'プッシュ通知の購読情報';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'プッシュ通知のエンドポイント';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'VAPID公開鍵';
COMMENT ON COLUMN push_subscriptions.auth IS '認証キー';

