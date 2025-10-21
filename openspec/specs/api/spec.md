# api Specification

## Purpose
TBD - created by archiving change add-furanomi-system. Update Purpose after archive.
## Requirements
### Requirement: 店舗検索API（位置情報ベース）
利用者は位置情報に基づいて店舗を検索できる。システムSHALL位置情報と検索半径を使用して店舗を検索し、営業時間を自動判定する。

#### Endpoint: GET /api/shops
- **Description**: 位置情報に基づく店舗検索
- **Parameters**:
  - `lat` (optional): 緯度
  - `lng` (optional): 経度
  - `radius` (optional): 検索半径（メートル単位）
  - `category` (optional): カテゴリフィルタ
  - `status` (optional): 空き状況フィルタ

#### Response Format
```json
[
  {
    "id": "uuid",
    "name": "店舗名",
    "description": "店舗説明",
    "address": "住所",
    "phone": "電話番号",
    "email": "メールアドレス",
    "category": "カテゴリ",
    "latitude": 緯度,
    "longitude": 経度,
    "business_hours": {
      "monday": {
        "open": "17:00",
        "close": "04:00",
        "close_next_day": true
      },
      "tuesday": {
        "open": "17:00",
        "close": "23:00"
      }
    },
    "image_url": "画像URL",
    "is_active": true,
    "availability_status": "available|busy|full|closed",
    "availability_updated_at": "更新日時",
    "distance": 距離（メートル）,
    "shop_manager": {
      "id": "uuid",
      "username": "ユーザー名",
      "first_name": "名",
      "last_name": "姓"
    }
  }
]
```

#### Scenario: 位置情報付き検索
- **WHEN** 利用者が位置情報を提供して店舗を検索する
- **THEN** 指定された半径内の店舗が返される
- **AND** 各店舗に距離情報が含まれる
- **AND** 営業中の店舗が上位、営業時間外の店舗が下位にソートされる

#### Scenario: 営業時間自動判定
- **WHEN** 店舗検索APIが呼び出される
- **THEN** 各店舗の営業時間が現在時刻と比較される
- **AND** 営業時間外の店舗は`availability_status`が`closed`に設定される
- **AND** 日付跨ぎ営業時間（例：17:00-04:00 翌日）も正しく判定される

### Requirement: 営業時間自動判定ロジック
システムは営業時間に基づいて店舗の営業状況を自動判定する。システムSHALL複雑な営業時間パターンに対応する。

#### Scenario: 同日営業の判定
- **WHEN** 店舗の営業時間が同日営業（例：08:00-20:00）の場合
- **THEN** 現在時刻が営業時間内であれば営業中、外であれば営業時間外と判定する

#### Scenario: 日付跨ぎ営業の判定
- **WHEN** 店舗の営業時間が日付跨ぎ（例：17:00-04:00 翌日）の場合
- **THEN** 現在時刻が営業開始時刻以降または営業終了時刻（翌日）未満であれば営業中と判定する

#### Scenario: 前日営業時間の考慮
- **WHEN** 現在時刻が今日の営業時間外の場合
- **THEN** 前日の営業時間が日付跨ぎで翌日まで営業している場合、その営業時間内かどうかを判定する

### Requirement: ソートロジック（営業時間考慮）
店舗検索結果は営業状況を考慮してソートされる。システムSHALL営業中の店舗を優先的に表示する。

#### Scenario: 営業状況によるソート
- **WHEN** 店舗検索結果が返される
- **THEN** 営業時間外の店舗（`availability_status: "closed"`）が最後に配置される
- **AND** 営業中の店舗が上位に配置される

#### Scenario: 距離によるソート
- **WHEN** 位置情報が提供される場合
- **THEN** 営業中の店舗は距離の近い順でソートされる
- **AND** 営業時間外の店舗も距離の近い順でソートされる

#### Scenario: 名前によるソート
- **WHEN** 位置情報が提供されない場合
- **THEN** 営業中の店舗は名前のアルファベット順でソートされる
- **AND** 営業時間外の店舗も名前のアルファベット順でソートされる

### Requirement: スタッフ用空き状況更新API
店舗スタッフはQRコードとパスコードで空き状況を更新できる。システムSHALL店舗管理者の認証なしで空き状況を更新する。

#### Endpoint: PUT /api/staff/availability/:token
- **Description**: スタッフ用空き状況更新
- **Parameters**:
  - `token`: QRコードに含まれるアクセストークン
- **Body**:
  ```json
  {
    "passcode": "1234",
    "status": "available|busy|full|closed"
  }
  ```

#### Response Format
```json
{
  "success": true,
  "status": "available",
  "updated_at": "更新日時"
}
```

#### Scenario: スタッフ認証
- **WHEN** スタッフがQRコードとパスコードで空き状況を更新する
- **THEN** トークンとパスコードが検証される
- **AND** 認証成功時は空き状況が更新される

#### Scenario: 認証エラー
- **WHEN** スタッフが無効なトークンまたはパスコードを提供する
- **THEN** 認証エラーが返される
- **AND** 空き状況は更新されない

### Requirement: 店舗管理者用スタッフアクセス管理API
店舗管理者はスタッフ用のアクセス情報を管理できる。システムSHALL QRコードとパスコードの生成・再発行を提供する。

#### Endpoint: GET /api/staff/access-info
- **Description**: スタッフ用アクセス情報取得
- **Authentication**: 店舗管理者認証必須

#### Response Format
```json
{
  "staff_access_token": "アクセストークン",
  "staff_passcode": "1234",
  "qr_code_url": "QRコードURL"
}
```

#### Endpoint: POST /api/staff/regenerate-access
- **Description**: スタッフ用アクセス情報再生成
- **Authentication**: 店舗管理者認証必須

#### Response Format
```json
{
  "staff_access_token": "新しいアクセストークン",
  "staff_passcode": "新しいパスコード",
  "qr_code_url": "新しいQRコードURL"
}
```

#### Scenario: アクセス情報生成
- **WHEN** 店舗管理者がスタッフ用アクセス情報を取得する
- **THEN** 無期限のアクセストークンと4桁パスコードが返される
- **AND** QRコードのURLが提供される

#### Scenario: アクセス情報再生成
- **WHEN** 店舗管理者がアクセス情報を再生成する
- **THEN** 新しいトークンとパスコードが生成される
- **AND** 古いアクセス情報は無効化される

### Requirement: システム設定管理API（営業時間設定除外）
システム管理者は営業時間設定を除外した基本設定を管理できる。システムSHALL検索半径などの基本設定のみを提供する。

#### Endpoint: GET /api/system/settings
- **Description**: システム設定取得
- **Authentication**: システム管理者認証必須

#### Response Format
```json
[
  {
    "key": "search_radius",
    "value": "1000",
    "description": "検索半径（メートル）"
  },
  {
    "key": "max_shops_display",
    "value": "50",
    "description": "最大表示店舗数"
  },
  {
    "key": "auto_refresh_interval",
    "value": "30",
    "description": "自動更新間隔（秒）"
  }
]
```

#### Endpoint: PUT /api/system/settings
- **Description**: システム設定更新
- **Authentication**: システム管理者認証必須
- **Body**:
```json
{
  "settings": [
    {
      "key": "search_radius",
      "value": "1500"
    }
  ]
}
```

#### Scenario: 設定取得
- **WHEN** システム管理者が設定を取得する
- **THEN** 営業時間設定を除外した基本設定が返される
- **AND** 各設定の説明が含まれる

#### Scenario: 設定更新
- **WHEN** システム管理者が設定を更新する
- **THEN** 変更内容がデータベースに保存される
- **AND** 利用者アプリの動作に即座に反映される

