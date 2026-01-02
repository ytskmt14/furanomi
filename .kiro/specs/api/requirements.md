# Requirements Document

## Introduction

API仕様は、ふらのみシステムのバックエンドAPIエンドポイントの動作を定義します。店舗検索、空き状況管理、スタッフアクセス、システム設定、Geocoding、郵便番号補完などの機能を提供するRESTful APIを定義します。位置情報ベースの検索、営業時間自動判定、認証・認可などの機能を含みます。

## Requirements

### Requirement 1: 店舗検索API（位置情報ベース）
**Objective:** As a 利用者, I want 位置情報に基づいて店舗を検索できる, so that 近くの店舗を見つけられる

#### Acceptance Criteria
1. WHEN 利用者が位置情報を提供して店舗を検索する THEN システム SHALL GET /api/shopsエンドポイントで位置情報と検索半径を使用して店舗を検索する
2. WHEN 位置情報が提供される場合 THEN システム SHALL 緯度（lat）と経度（lng）パラメータを受け取る
3. WHEN 検索半径が指定される場合 THEN システム SHALL 半径（radius）パラメータで検索範囲を制限する
4. WHEN カテゴリフィルタが指定される場合 THEN システム SHALL カテゴリ（category）パラメータで店舗をフィルタする
5. WHEN 空き状況フィルタが指定される場合 THEN システム SHALL 空き状況（status）パラメータで店舗をフィルタする
6. WHEN 位置情報付き検索が実行される場合 THEN システム SHALL 指定された半径内の店舗を返す
7. WHEN 位置情報付き検索が実行される場合 THEN システム SHALL 各店舗に距離情報を含める
8. WHEN 店舗検索結果が返される場合 THEN システム SHALL 営業中の店舗を上位、営業時間外の店舗を下位にソートする
9. WHEN 店舗検索APIが呼び出される場合 THEN システム SHALL 各店舗の営業時間を現在時刻と比較する
10. WHEN 店舗検索APIが呼び出される場合 THEN システム SHALL 営業時間外の店舗のavailability_statusをclosedに設定する
11. WHEN 店舗検索APIが呼び出される場合 THEN システム SHALL 日付跨ぎ営業時間（例：17:00-04:00 翌日）も正しく判定する
12. WHEN 店舗検索APIが呼び出される場合 THEN システム SHALL 以下の情報を含むJSONレスポンスを返す：id、name、description、address、phone、email、category、latitude、longitude、postal_code、formatted_address、place_id、geocoded_at、business_hours、image_url、is_active、availability_status、availability_updated_at、distance、shop_manager

### Requirement 2: 営業時間自動判定ロジック
**Objective:** As a システム, I want 営業時間に基づいて店舗の営業状況を自動判定する, so that 複雑な営業時間パターンに対応できる

#### Acceptance Criteria
1. WHEN 店舗の営業時間が同日営業（例：08:00-20:00）の場合 THEN システム SHALL 現在時刻が営業時間内であれば営業中、外であれば営業時間外と判定する
2. WHEN 店舗の営業時間が日付跨ぎ（例：17:00-04:00 翌日）の場合 THEN システム SHALL 現在時刻が営業開始時刻以降または営業終了時刻（翌日）未満であれば営業中と判定する
3. WHEN 現在時刻が今日の営業時間外の場合 THEN システム SHALL 前日の営業時間が日付跨ぎで翌日まで営業している場合、その営業時間内かどうかを判定する

### Requirement 3: ソートロジック（営業時間考慮）
**Objective:** As a 利用者, I want 店舗検索結果が営業状況を考慮してソートされる, so that 営業中の店舗を優先的に確認できる

#### Acceptance Criteria
1. WHEN 店舗検索結果が返される場合 THEN システム SHALL 営業時間外の店舗（availability_status: "closed"）を最後に配置する
2. WHEN 店舗検索結果が返される場合 THEN システム SHALL 営業中の店舗を上位に配置する
3. WHEN 位置情報が提供される場合 THEN システム SHALL 営業中の店舗を距離の近い順でソートする
4. WHEN 位置情報が提供される場合 THEN システム SHALL 営業時間外の店舗も距離の近い順でソートする
5. WHEN 位置情報が提供されない場合 THEN システム SHALL 営業中の店舗を名前のアルファベット順でソートする
6. WHEN 位置情報が提供されない場合 THEN システム SHALL 営業時間外の店舗も名前のアルファベット順でソートする

### Requirement 4: スタッフ用空き状況更新API
**Objective:** As a 店舗スタッフ, I want QRコードとパスコードで空き状況を更新できる, so that 店舗管理者の認証なしで空き状況を更新できる

#### Acceptance Criteria
1. WHEN スタッフがQRコードとパスコードで空き状況を更新する場合 THEN システム SHALL PUT /api/staff/availability/:tokenエンドポイントでトークンとパスコードを検証する
2. WHEN スタッフがQRコードとパスコードで空き状況を更新する場合 THEN システム SHALL リクエストボディでpasscodeとstatusを受け取る
3. WHEN スタッフ認証が成功する場合 THEN システム SHALL 空き状況を更新する
4. WHEN スタッフが無効なトークンまたはパスコードを提供する場合 THEN システム SHALL 認証エラーを返す
5. WHEN スタッフが無効なトークンまたはパスコードを提供する場合 THEN システム SHALL 空き状況を更新しない
6. WHEN 空き状況更新が成功する場合 THEN システム SHALL 以下の情報を含むJSONレスポンスを返す：success、status、updated_at

### Requirement 5: 店舗管理者用スタッフアクセス管理API
**Objective:** As a 店舗管理者, I want スタッフ用のアクセス情報を管理できる, so that QRコードとパスコードの生成・再発行ができる

#### Acceptance Criteria
1. WHEN 店舗管理者がスタッフ用アクセス情報を取得する場合 THEN システム SHALL GET /api/staff/access-infoエンドポイントで店舗管理者認証を要求する
2. WHEN 店舗管理者がスタッフ用アクセス情報を取得する場合 THEN システム SHALL 無期限のアクセストークンと4桁パスコードを返す
3. WHEN 店舗管理者がスタッフ用アクセス情報を取得する場合 THEN システム SHALL QRコードのURLを提供する
4. WHEN 店舗管理者がアクセス情報を再生成する場合 THEN システム SHALL POST /api/staff/regenerate-accessエンドポイントで店舗管理者認証を要求する
5. WHEN 店舗管理者がアクセス情報を再生成する場合 THEN システム SHALL 新しいトークンとパスコードを生成する
6. WHEN 店舗管理者がアクセス情報を再生成する場合 THEN システム SHALL 古いアクセス情報を無効化する
7. WHEN スタッフ用アクセス情報が取得される場合 THEN システム SHALL 以下の情報を含むJSONレスポンスを返す：staff_access_token、staff_passcode、qr_code_url

### Requirement 6: システム設定管理API（営業時間設定除外）
**Objective:** As a システム管理者, I want 営業時間設定を除外した基本設定を管理できる, so that 検索半径などの基本設定を変更できる

#### Acceptance Criteria
1. WHEN システム管理者が設定を取得する場合 THEN システム SHALL GET /api/system/settingsエンドポイントでシステム管理者認証を要求する
2. WHEN システム管理者が設定を取得する場合 THEN システム SHALL 営業時間設定を除外した基本設定を返す
3. WHEN システム管理者が設定を取得する場合 THEN システム SHALL 各設定の説明を含める
4. WHEN システム管理者が設定を取得する場合 THEN システム SHALL 以下の設定項目を含む：search_radius（検索半径）、max_shops_display（最大表示店舗数）、auto_refresh_interval（自動更新間隔）
5. WHEN システム管理者が設定を更新する場合 THEN システム SHALL PUT /api/system/settingsエンドポイントでシステム管理者認証を要求する
6. WHEN システム管理者が設定を更新する場合 THEN システム SHALL リクエストボディでsettings配列を受け取る
7. WHEN システム管理者が設定を更新する場合 THEN システム SHALL 変更内容をデータベースに保存する
8. WHEN システム管理者が設定を更新する場合 THEN システム SHALL 利用者アプリの動作に即座に反映する

### Requirement 7: Geocoding API（バックエンドプロキシ経由）
**Objective:** As a システム管理者または店舗管理者, I want 住所から位置情報を自動取得できる, so that Google Maps Geocoding APIをバックエンド経由で安全に利用できる

#### Acceptance Criteria
1. WHEN システム管理者または店舗管理者が住所を入力する場合 THEN システム SHALL POST /api/geocodingエンドポイントでシステム管理者・店舗管理者認証を要求する
2. WHEN システム管理者または店舗管理者が住所を入力する場合 THEN システム SHALL リクエストボディでaddressを受け取る
3. WHEN 住所から位置情報を取得する場合 THEN システム SHALL Google Maps Geocoding APIで位置情報を取得する
4. WHEN 住所から位置情報を取得する場合 THEN システム SHALL 正規化された住所とPlace IDを返す
5. WHEN 住所から位置情報を取得する場合 THEN システム SHALL 郵便番号も自動的に取得する
6. WHEN Geocoding APIでエラーが発生する場合 THEN システム SHALL 適切なエラーメッセージを返す
7. WHEN Geocoding APIでエラーが発生する場合 THEN システム SHALL 位置情報の取得に失敗した場合は手動入力を可能にする
8. WHEN Geocoding APIが成功する場合 THEN システム SHALL 以下の情報を含むJSONレスポンスを返す：success、latitude、longitude、formatted_address、place_id、postal_code

### Requirement 8: 郵便番号補完API
**Objective:** As a 利用者, I want 郵便番号から住所を自動補完できる, so that 住所入力を簡単にできる

#### Acceptance Criteria
1. WHEN 利用者が郵便番号を入力する場合 THEN システム SHALL GET /api/postal-code/:postalCodeエンドポイントで郵便番号（ハイフンなし）を受け取る
2. WHEN 郵便番号補完が実行される場合 THEN システム SHALL zipcloud APIで住所候補を取得する
3. WHEN 郵便番号補完が実行される場合 THEN システム SHALL 都道府県、市区町村、町域を返す
4. WHEN 郵便番号補完が実行される場合 THEN システム SHALL フロントエンドで住所入力フィールドが自動補完される
5. WHEN 郵便番号補完が成功する場合 THEN システム SHALL 以下の情報を含むJSONレスポンスを返す：success、addresses（prefecture、city、townを含む配列）

