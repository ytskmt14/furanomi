# database Specification

## Purpose
TBD - created by archiving change add-furanomi-system. Update Purpose after archive.
## Requirements
### Requirement: 店舗テーブル（営業時間構造拡張）
店舗の営業時間は日付跨ぎに対応した構造で保存される。システムSHALL複雑な営業時間パターンをサポートする。

#### Table: shops
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  postal_code VARCHAR(8),
  formatted_address VARCHAR(500),
  place_id VARCHAR(255),
  geocoded_at TIMESTAMP WITH TIME ZONE,
  business_hours JSONB NOT NULL,
  image_url TEXT,
  staff_access_token UUID DEFAULT uuid_generate_v4(),
  staff_passcode VARCHAR(4) DEFAULT NULL,
  staff_token_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  shop_manager_id UUID REFERENCES shop_managers(id) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shops_staff_access_token_unique UNIQUE (staff_access_token)
);
```

#### business_hours JSONB構造
```json
{
  "monday": {
    "open": "17:00",
    "close": "04:00",
    "close_next_day": true
  },
  "tuesday": {
    "open": "17:00",
    "close": "23:00"
  },
  "wednesday": {
    "open": "17:00",
    "close": "23:00"
  },
  "thursday": {
    "open": "17:00",
    "close": "23:00"
  },
  "friday": {
    "open": "17:00",
    "close": "24:00"
  },
  "saturday": {
    "open": "17:00",
    "close": "24:00"
  },
  "sunday": {
    "open": "17:00",
    "close": "22:00"
  }
}
```

#### Scenario: 営業時間の保存
- **WHEN** 店舗管理者が営業時間を設定する
- **THEN** 各曜日の営業時間がJSONB形式で保存される
- **AND** `close_next_day`フラグで日付跨ぎ営業を表現する

#### Scenario: 営業時間の取得
- **WHEN** 店舗情報が取得される
- **THEN** 営業時間がJSONB形式で返される
- **AND** フロントエンドで各曜日の営業時間を表示できる

### Requirement: スタッフ用アクセス管理
店舗スタッフはQRコードとパスコードで空き状況を更新できる。システムSHALL店舗ごとのスタッフアクセス情報を管理する。

#### Table: shops（スタッフ用アクセス情報追加）
```sql
ALTER TABLE shops ADD COLUMN staff_access_token VARCHAR(255);
ALTER TABLE shops ADD COLUMN staff_passcode VARCHAR(4);
```

#### Scenario: スタッフアクセス情報の生成
- **WHEN** 店舗管理者がスタッフ用アクセス情報を生成する
- **THEN** 無期限のアクセストークンと4桁パスコードが生成される
- **AND** 店舗テーブルに保存される
- **AND** staff_access_tokenはUUID形式で一意性が保証される
- **AND** staff_passcodeは4桁の数字でランダム生成される

#### Scenario: スタッフ認証
- **WHEN** スタッフがQRコードとパスコードで認証する
- **THEN** アクセストークンとパスコードが検証される
- **AND** 認証成功時は空き状況更新が可能になる
- **AND** QRコードにはstaff_access_tokenが含まれる

#### Scenario: 住所情報管理
- **WHEN** 店舗が登録または更新される
- **THEN** 郵便番号、正規化住所、Place IDが保存される
- **AND** Geocoding実行日時が記録される
- **AND** 画像データはBase64エンコードでTEXT型カラムに保存される

### Requirement: 空き状況テーブル（一意制約）
店舗の空き状況は1店舗につき1レコードで管理される。システムSHALL店舗ごとの空き状況の重複を防ぐ。

#### Table: shop_availability
```sql
CREATE TABLE shop_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'busy', 'full', 'closed')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Scenario: 空き状況の更新
- **WHEN** 店舗管理者またはスタッフが空き状況を更新する
- **THEN** UPSERT操作で既存レコードを更新または新規作成する
- **AND** 店舗ごとに1つの空き状況レコードのみが存在する

### Requirement: システム設定テーブル（営業時間設定除外）
システム全体の設定は営業時間設定を除外した基本設定のみを管理する。システムSHALL検索半径などの基本設定を提供する。

#### Table: system_settings
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 初期データ
```sql
INSERT INTO system_settings (key, value, description) VALUES
('search_radius', '1000', '検索半径（メートル）'),
('max_shops_display', '50', '最大表示店舗数'),
('auto_refresh_interval', '30', '自動更新間隔（秒）');
```

#### Scenario: システム設定の管理
- **WHEN** システム管理者が設定を更新する
- **THEN** 営業時間設定を除外した基本設定のみが管理される
- **AND** 各設定の説明が含まれる

### Requirement: 店舗管理者テーブル（1対1関係）
店舗管理者と店舗は1対1の関係で管理される。システムSHALL店舗管理者が複数の店舗を管理できないようにする。

#### Table: shop_managers
```sql
CREATE TABLE shop_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: shops（1対1関係制約）
```sql
ALTER TABLE shops ADD CONSTRAINT unique_shop_manager UNIQUE (shop_manager_id);
```

#### Scenario: 店舗管理者と店舗の関連付け
- **WHEN** システム管理者が店舗と店舗管理者を関連付ける
- **THEN** 1つの店舗管理者は1つの店舗のみを管理できる
- **AND** 1つの店舗は1つの店舗管理者のみに割り当てられる

### Requirement: 認証テーブル
システム管理者と店舗管理者の認証情報を管理する。システムSHALLセキュアな認証システムを提供する。

#### Table: system_admins
```sql
CREATE TABLE system_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Scenario: 認証情報の管理
- **WHEN** ユーザーがログインする
- **THEN** パスワードハッシュが検証される
- **AND** JWTトークンが生成される
- **AND** HTTP-onlyクッキーでセッションが管理される

### Requirement: データベース制約とインデックス
データベースの整合性とパフォーマンスを確保する。システムSHALL適切な制約とインデックスを設定する。

#### 制約
- 店舗管理者と店舗の1対1関係（UNIQUE制約）
- 空き状況の一意性（shop_id UNIQUE制約）
- 営業時間のJSONB構造検証
- パスワードハッシュの必須制約

#### インデックス
```sql
-- 位置情報検索用インデックス
CREATE INDEX idx_shops_location ON shops USING GIST (ll_to_earth(latitude, longitude));

-- カテゴリ検索用インデックス
CREATE INDEX idx_shops_category ON shops(category);

-- アクティブ店舗検索用インデックス
CREATE INDEX idx_shops_active ON shops(is_active);

-- 空き状況検索用インデックス
CREATE INDEX idx_shop_availability_status ON shop_availability(status);

-- 郵便番号検索用インデックス
CREATE INDEX idx_shops_postal_code ON shops(postal_code);

-- Place ID検索用インデックス
CREATE INDEX idx_shops_place_id ON shops(place_id);

-- スタッフアクセストークン検索用インデックス
CREATE INDEX idx_shops_staff_token ON shops(staff_access_token);
```

#### Scenario: パフォーマンス最適化
- **WHEN** 位置情報に基づく店舗検索が実行される
- **THEN** 地理空間インデックスを使用して高速検索が可能になる
- **AND** カテゴリや空き状況でのフィルタリングも高速化される

