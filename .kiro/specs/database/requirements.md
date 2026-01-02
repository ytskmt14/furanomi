# Requirements Document

## Introduction

データベース仕様は、ふらのみシステムのデータベーススキーマ、テーブル構造、制約、インデックスを定義します。店舗情報、営業時間、空き状況、スタッフアクセス、システム設定、認証情報などのデータを管理するためのリレーショナルデータベース設計を含みます。日付跨ぎ営業時間のサポート、1対1関係の制約、パフォーマンス最適化のためのインデックスなどを定義します。

## Requirements

### Requirement 1: 店舗テーブル（営業時間構造拡張）
**Objective:** As a システム, I want 店舗の営業時間を日付跨ぎに対応した構造で保存する, so that 複雑な営業時間パターンをサポートできる

#### Acceptance Criteria
1. WHEN 店舗テーブルが作成される場合 THEN システム SHALL 以下のカラムを含むテーブルを作成する：id（UUID、主キー）、name（VARCHAR(255)、NOT NULL）、description（TEXT）、address（VARCHAR(500)、NOT NULL）、phone（VARCHAR(20)）、email（VARCHAR(255)）、category（VARCHAR(50)、NOT NULL）、latitude（DECIMAL(10, 8)、NOT NULL）、longitude（DECIMAL(11, 8)、NOT NULL）、postal_code（VARCHAR(8)）、formatted_address（VARCHAR(500)）、place_id（VARCHAR(255)）、geocoded_at（TIMESTAMP WITH TIME ZONE）、business_hours（JSONB、NOT NULL）、image_url（TEXT）、staff_access_token（UUID、デフォルト値あり）、staff_passcode（VARCHAR(4)）、staff_token_created_at（TIMESTAMP WITH TIME ZONE）、shop_manager_id（UUID、外部キー、UNIQUE）、is_active（BOOLEAN、デフォルトtrue）、created_at（TIMESTAMP）、updated_at（TIMESTAMP）
2. WHEN 店舗テーブルが作成される場合 THEN システム SHALL staff_access_tokenにUNIQUE制約を設定する
3. WHEN 店舗管理者が営業時間を設定する場合 THEN システム SHALL 各曜日の営業時間をJSONB形式で保存する
4. WHEN 店舗管理者が営業時間を設定する場合 THEN システム SHALL close_next_dayフラグで日付跨ぎ営業を表現する
5. WHEN 店舗情報が取得される場合 THEN システム SHALL 営業時間をJSONB形式で返す
6. WHEN 店舗情報が取得される場合 THEN システム SHALL フロントエンドで各曜日の営業時間を表示できるようにする

### Requirement 2: スタッフ用アクセス管理
**Objective:** As a システム, I want 店舗ごとのスタッフアクセス情報を管理する, so that 店舗スタッフがQRコードとパスコードで空き状況を更新できる

#### Acceptance Criteria
1. WHEN 店舗テーブルにスタッフ用アクセス情報が追加される場合 THEN システム SHALL staff_access_tokenカラム（VARCHAR(255)）を追加する
2. WHEN 店舗テーブルにスタッフ用アクセス情報が追加される場合 THEN システム SHALL staff_passcodeカラム（VARCHAR(4)）を追加する
3. WHEN 店舗管理者がスタッフ用アクセス情報を生成する場合 THEN システム SHALL 無期限のアクセストークンと4桁パスコードを生成する
4. WHEN 店舗管理者がスタッフ用アクセス情報を生成する場合 THEN システム SHALL 店舗テーブルに保存する
5. WHEN 店舗管理者がスタッフ用アクセス情報を生成する場合 THEN システム SHALL staff_access_tokenをUUID形式で一意性を保証する
6. WHEN 店舗管理者がスタッフ用アクセス情報を生成する場合 THEN システム SHALL staff_passcodeを4桁の数字でランダム生成する
7. WHEN スタッフがQRコードとパスコードで認証する場合 THEN システム SHALL アクセストークンとパスコードを検証する
8. WHEN スタッフがQRコードとパスコードで認証する場合 THEN システム SHALL 認証成功時は空き状況更新を可能にする
9. WHEN スタッフがQRコードとパスコードで認証する場合 THEN システム SHALL QRコードにstaff_access_tokenを含める
10. WHEN 店舗が登録または更新される場合 THEN システム SHALL 郵便番号、正規化住所、Place IDを保存する
11. WHEN 店舗が登録または更新される場合 THEN システム SHALL Geocoding実行日時を記録する
12. WHEN 店舗が登録または更新される場合 THEN システム SHALL 画像データをBase64エンコードでTEXT型カラムに保存する

### Requirement 3: 空き状況テーブル（一意制約）
**Objective:** As a システム, I want 店舗ごとの空き状況の重複を防ぐ, so that 1店舗につき1レコードで管理できる

#### Acceptance Criteria
1. WHEN 空き状況テーブルが作成される場合 THEN システム SHALL 以下のカラムを含むテーブルを作成する：id（UUID、主キー）、shop_id（UUID、外部キー、UNIQUE）、status（VARCHAR(20)、NOT NULL、CHECK制約）、updated_at（TIMESTAMP）
2. WHEN 空き状況テーブルが作成される場合 THEN システム SHALL statusカラムにCHECK制約を設定し、'available'、'busy'、'full'、'closed'のみを許可する
3. WHEN 空き状況テーブルが作成される場合 THEN システム SHALL shop_idカラムにUNIQUE制約を設定する
4. WHEN 店舗管理者またはスタッフが空き状況を更新する場合 THEN システム SHALL UPSERT操作で既存レコードを更新または新規作成する
5. WHEN 店舗管理者またはスタッフが空き状況を更新する場合 THEN システム SHALL 店舗ごとに1つの空き状況レコードのみが存在するようにする

### Requirement 4: システム設定テーブル（営業時間設定除外）
**Objective:** As a システム, I want 営業時間設定を除外した基本設定のみを管理する, so that 検索半径などの基本設定を提供できる

#### Acceptance Criteria
1. WHEN システム設定テーブルが作成される場合 THEN システム SHALL 以下のカラムを含むテーブルを作成する：id（UUID、主キー）、key（VARCHAR(100)、UNIQUE、NOT NULL）、value（TEXT、NOT NULL）、description（TEXT）、created_at（TIMESTAMP）、updated_at（TIMESTAMP）
2. WHEN システム設定テーブルが初期化される場合 THEN システム SHALL 以下の初期データを挿入する：search_radius（検索半径、メートル）、max_shops_display（最大表示店舗数）、auto_refresh_interval（自動更新間隔、秒）
3. WHEN システム管理者が設定を更新する場合 THEN システム SHALL 営業時間設定を除外した基本設定のみを管理する
4. WHEN システム管理者が設定を更新する場合 THEN システム SHALL 各設定の説明を含める

### Requirement 5: 店舗管理者テーブル（1対1関係）
**Objective:** As a システム, I want 店舗管理者が複数の店舗を管理できないようにする, so that 店舗管理者と店舗の1対1関係を維持できる

#### Acceptance Criteria
1. WHEN 店舗管理者テーブルが作成される場合 THEN システム SHALL 以下のカラムを含むテーブルを作成する：id（UUID、主キー）、username（VARCHAR(50)、UNIQUE、NOT NULL）、password_hash（VARCHAR(255)、NOT NULL）、first_name（VARCHAR(100)、NOT NULL）、last_name（VARCHAR(100)、NOT NULL）、is_active（BOOLEAN、デフォルトtrue）、created_at（TIMESTAMP）、updated_at（TIMESTAMP）
2. WHEN 店舗テーブルに1対1関係制約が追加される場合 THEN システム SHALL shop_manager_idカラムにUNIQUE制約を追加する
3. WHEN システム管理者が店舗と店舗管理者を関連付ける場合 THEN システム SHALL 1つの店舗管理者は1つの店舗のみを管理できるようにする
4. WHEN システム管理者が店舗と店舗管理者を関連付ける場合 THEN システム SHALL 1つの店舗は1つの店舗管理者のみに割り当てられるようにする

### Requirement 6: 認証テーブル
**Objective:** As a システム, I want セキュアな認証システムを提供する, so that システム管理者と店舗管理者の認証情報を管理できる

#### Acceptance Criteria
1. WHEN システム管理者テーブルが作成される場合 THEN システム SHALL 以下のカラムを含むテーブルを作成する：id（UUID、主キー）、username（VARCHAR(50)、UNIQUE、NOT NULL）、password_hash（VARCHAR(255)、NOT NULL）、first_name（VARCHAR(100)、NOT NULL）、last_name（VARCHAR(100)、NOT NULL）、is_active（BOOLEAN、デフォルトtrue）、created_at（TIMESTAMP）、updated_at（TIMESTAMP）
2. WHEN ユーザーがログインする場合 THEN システム SHALL パスワードハッシュを検証する
3. WHEN ユーザーがログインする場合 THEN システム SHALL JWTトークンを生成する
4. WHEN ユーザーがログインする場合 THEN システム SHALL HTTP-onlyクッキーでセッションを管理する

### Requirement 7: データベース制約とインデックス
**Objective:** As a システム, I want データベースの整合性とパフォーマンスを確保する, so that 適切な制約とインデックスを設定できる

#### Acceptance Criteria
1. WHEN データベース制約が設定される場合 THEN システム SHALL 店舗管理者と店舗の1対1関係（UNIQUE制約）を設定する
2. WHEN データベース制約が設定される場合 THEN システム SHALL 空き状況の一意性（shop_id UNIQUE制約）を設定する
3. WHEN データベース制約が設定される場合 THEN システム SHALL 営業時間のJSONB構造検証を設定する
4. WHEN データベース制約が設定される場合 THEN システム SHALL パスワードハッシュの必須制約を設定する
5. WHEN データベースインデックスが作成される場合 THEN システム SHALL 位置情報検索用インデックス（GIST）を作成する
6. WHEN データベースインデックスが作成される場合 THEN システム SHALL カテゴリ検索用インデックスを作成する
7. WHEN データベースインデックスが作成される場合 THEN システム SHALL アクティブ店舗検索用インデックスを作成する
8. WHEN データベースインデックスが作成される場合 THEN システム SHALL 空き状況検索用インデックスを作成する
9. WHEN データベースインデックスが作成される場合 THEN システム SHALL 郵便番号検索用インデックスを作成する
10. WHEN データベースインデックスが作成される場合 THEN システム SHALL Place ID検索用インデックスを作成する
11. WHEN データベースインデックスが作成される場合 THEN システム SHALL スタッフアクセストークン検索用インデックスを作成する
12. WHEN 位置情報に基づく店舗検索が実行される場合 THEN システム SHALL 地理空間インデックスを使用して高速検索を可能にする
13. WHEN 位置情報に基づく店舗検索が実行される場合 THEN システム SHALL カテゴリや空き状況でのフィルタリングも高速化する

