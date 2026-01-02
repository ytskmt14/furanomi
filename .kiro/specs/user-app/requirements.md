# Requirements Document

## Introduction

利用者アプリは、利用者が現在地から近いお店の空き状況をリアルタイムで確認できるWebアプリケーション（PWA）です。位置情報に基づいて店舗を検索し、リスト表示や地図表示で店舗情報を確認できます。店舗の空き状況、営業時間、詳細情報を表示し、利用者が簡単にお店を見つけられるサービスを提供します。

## Requirements

### Requirement 1: 店舗検索・一覧表示
**Objective:** As a 利用者, I want 現在地から近い店舗の空き状況を確認できる, so that 空いている店舗を見つけられる

#### Acceptance Criteria
1. WHEN 利用者がアプリにアクセスする THEN システム SHALL ブラウザの位置情報APIを使用して現在地を取得する
2. WHEN 現在地が取得される THEN システム SHALL 取得した位置情報を「現在地: [住所]」として表示する
3. WHEN 利用者の位置情報が取得される THEN システム SHALL 設定された検索半径内の店舗を検索する
4. WHEN 店舗検索が実行される THEN システム SHALL 営業時間外の店舗を自動的に「営業時間外」として判定する
5. WHEN 店舗検索が完了する THEN システム SHALL 店舗カードを一覧で表示する
6. WHEN 店舗一覧が表示される THEN システム SHALL 営業中の店舗を上位、営業時間外の店舗を下位に表示する
7. WHEN 店舗一覧が表示される THEN システム SHALL 営業中の店舗を距離順でソートする

### Requirement 2: 店舗カード表示
**Objective:** As a 利用者, I want 店舗の基本情報をカード形式で確認できる, so that 重要な情報を素早く把握できる

#### Acceptance Criteria
1. WHEN 利用者が店舗一覧を表示する THEN システム SHALL 各店舗カードに店舗画像（Base64エンコード、圧縮済み）を表示する
2. WHEN 利用者が店舗一覧を表示する THEN システム SHALL 各店舗カードの左上に空き状況バッジ（🟢空きあり、🟡混雑、🔴満席、⚫営業時間外）を表示する
3. WHEN 利用者が店舗一覧を表示する THEN システム SHALL 各店舗カードの右上に距離表示（📍 [距離]m）を表示する
4. WHEN 利用者が店舗一覧を表示する THEN システム SHALL 各店舗カードに店舗名を表示する
5. WHEN 利用者が店舗一覧を表示する THEN システム SHALL 各店舗カードにハッシュタグ形式のカテゴリ（#居酒屋、#カフェ、#レストラン）を表示する
6. WHEN 店舗が営業時間外の場合 THEN システム SHALL 店舗画像上に「営業時間外」オーバーレイを表示する
7. WHEN 店舗が営業時間外の場合 THEN システム SHALL カードのクリックを無効化する
8. WHEN 利用者が店舗一覧を表示する THEN システム SHALL 住所を表示しない（店舗詳細でのみ表示）
9. WHEN 利用者が店舗一覧を表示する THEN システム SHALL カテゴリアイコンを表示しない（ハッシュタグで代替）

### Requirement 3: 店舗詳細表示
**Objective:** As a 利用者, I want 店舗の詳細情報を確認できる, so that 営業時間や連絡先などの詳細を把握できる

#### Acceptance Criteria
1. WHEN 利用者が営業中の店舗カードをクリックする THEN システム SHALL 店舗詳細モーダルを表示する
2. WHEN 店舗詳細モーダルが表示される THEN システム SHALL 店舗名と空き状況バッジを表示する
3. WHEN 店舗詳細モーダルが表示される THEN システム SHALL 店舗説明を表示する
4. WHEN 店舗詳細モーダルが表示される THEN システム SHALL カテゴリを表示する
5. WHEN 店舗詳細モーダルが表示される THEN システム SHALL 住所を表示する
6. WHEN 電話番号が設定されている場合 THEN システム SHALL 電話番号を表示する
7. WHEN メールアドレスが設定されている場合 THEN システム SHALL メールアドレスを表示する
8. WHEN 店舗詳細モーダルが表示される THEN システム SHALL 全曜日の営業時間を表示する
9. WHEN 営業時間が表示される THEN システム SHALL 以下の形式で営業時間を表示する：日曜日: 17:00 - 22:00、月曜日: 17:00 - 04:00 (翌日) など
10. WHEN 営業時間が設定されていない曜日がある場合 THEN システム SHALL 「定休日」と表示する
11. WHEN 利用者が店舗詳細を表示する THEN システム SHALL 現在地からの距離を表示しない（店舗一覧でのみ表示）
12. WHEN 利用者が店舗詳細を表示する THEN システム SHALL 現在の曜日に基づいて営業時間を動的に表示する
13. WHEN 日付跨ぎ営業時間（例：17:00-04:00 翌日）が存在する場合 THEN システム SHALL 正しく表示する

### Requirement 4: 営業時間自動判定
**Objective:** As a 利用者, I want 営業時間に基づいて店舗の営業状況が自動判定される, so that 正確な営業状況を確認できる

#### Acceptance Criteria
1. WHEN 店舗の営業時間が同日営業（例：08:00-20:00）の場合 THEN システム SHALL 現在時刻が営業時間内であれば営業中、外であれば営業時間外と判定する
2. WHEN 店舗の営業時間が日付跨ぎ（例：17:00-04:00 翌日）の場合 THEN システム SHALL 現在時刻が営業開始時刻以降または営業終了時刻（翌日）未満であれば営業中と判定する
3. WHEN 現在時刻が今日の営業時間外の場合 THEN システム SHALL 前日の営業時間が日付跨ぎで翌日まで営業している場合、その営業時間内かどうかを判定する

### Requirement 5: レスポンシブデザイン
**Objective:** As a 利用者, I want モバイルデバイスでも快適に利用できる, so that どこからでも店舗情報を確認できる

#### Acceptance Criteria
1. WHEN 利用者がスマートフォンでアプリにアクセスする THEN システム SHALL モバイルに最適化されたUIで操作できるようにする
2. WHEN 利用者がスマートフォンでアプリにアクセスする THEN システム SHALL 店舗カードを1列表示で見やすく配置する
3. WHEN 利用者がタブレットでアプリにアクセスする THEN システム SHALL タブレットに最適化されたUIで操作できるようにする
4. WHEN 利用者がタブレットでアプリにアクセスする THEN システム SHALL 店舗カードを2列表示で効率的に配置する

### Requirement 6: 表示切り替え機能
**Objective:** As a 利用者, I want リスト表示と地図表示を切り替えられる, so that 好みの表示方法で店舗を確認できる

#### Acceptance Criteria
1. WHEN 利用者が表示モードを切り替える THEN システム SHALL 「リスト表示」と「地図表示」のボタンを表示する
2. WHEN 利用者が表示切り替えボタンをクリックする THEN システム SHALL リスト表示と地図表示を切り替える
3. WHEN 表示モードが切り替わる THEN システム SHALL 現在の表示モードが視覚的に分かるようにする
4. WHEN 表示モードが切り替わる THEN システム SHALL 同じ店舗データを両方の表示で使用する
5. WHEN 表示モードが切り替わる THEN システム SHALL 検索結果やフィルタを両方に反映する

### Requirement 7: 検索・フィルタ機能
**Objective:** As a 利用者, I want 店舗を検索・フィルタできる, so that 目的の店舗を素早く見つけられる

#### Acceptance Criteria
1. WHEN 利用者が検索ボタンをクリックする THEN システム SHALL 検索モーダルを表示する
2. WHEN 検索モーダルが表示される THEN システム SHALL 店舗名、カテゴリ、空き状況でフィルタできるようにする
3. WHEN 利用者が空き状況でフィルタする THEN システム SHALL 「空きあり」「混雑」「満席」「営業時間外」で絞り込めるようにする

### Requirement 8: 地図表示機能
**Objective:** As a 利用者, I want 店舗の位置を地図上で確認できる, so that 店舗の位置関係を視覚的に把握できる

#### Acceptance Criteria
1. WHEN 利用者が地図表示に切り替える THEN システム SHALL Google Maps APIを初期化し、現在地を中心とした地図を表示する
2. WHEN 地図が表示される THEN システム SHALL 地図のズームレベルを適切に設定する
3. WHEN 地図が表示される THEN システム SHALL 検索結果の店舗をマーカーとして表示する
4. WHEN 店舗マーカーが表示される THEN システム SHALL 各マーカーを空き状況に応じて色分けする
5. WHEN 店舗マーカーが表示される THEN システム SHALL マーカーに店舗名を表示する
6. WHEN 店舗マーカーが表示される THEN システム SHALL 空きありの店舗を緑色、混雑の店舗を黄色、満席の店舗を赤色、営業時間外の店舗をグレーで表示する
7. WHEN 利用者が店舗マーカーをクリックする THEN システム SHALL 店舗詳細モーダルを表示する
8. WHEN 店舗詳細モーダルが地図から表示される場合 THEN システム SHALL リスト表示と同じ店舗詳細情報を表示する
9. WHEN 地図表示機能が初期化される THEN システム SHALL Google Maps JavaScript API v3を使用する
10. WHEN 地図表示機能が初期化される THEN システム SHALL AdvancedMarkerElementを使用する（非推奨警告の回避）
11. WHEN 地図表示機能が初期化される THEN システム SHALL フロントエンド用APIキーをHTTP referer制限で保護する

### Requirement 9: レスポンシブ地図表示
**Objective:** As a 利用者, I want モバイルデバイスでも地図表示を快適に利用できる, so that 外出先でも店舗の位置を確認できる

#### Acceptance Criteria
1. WHEN 利用者がスマートフォンで地図表示にアクセスする THEN システム SHALL モバイルに最適化された地図サイズで表示する
2. WHEN 利用者がスマートフォンで地図表示にアクセスする THEN システム SHALL タッチ操作で地図の移動・ズームを可能にする
3. WHEN 利用者がタブレットで地図表示にアクセスする THEN システム SHALL タブレットに最適化された地図サイズで表示する
4. WHEN 利用者がタブレットで地図表示にアクセスする THEN システム SHALL より大きな画面を活用した表示を行う

### Requirement 10: セキュリティとAPIキー管理
**Objective:** As a システム, I want Google Maps APIキーを安全に管理する, so that APIキーが漏洩しない

#### Acceptance Criteria
1. WHEN システムがGoogle Maps APIを使用する THEN システム SHALL 開発環境と本番環境で異なるAPIキーを使用する
2. WHEN システムがGoogle Maps APIを使用する THEN システム SHALL フロントエンド用APIキーをHTTP referer制限で保護する
3. WHEN システムがGoogle Maps APIを使用する THEN システム SHALL バックエンド用APIキーをIP制限なしでGeocoding APIにアクセスする
4. WHEN フロントエンドが住所から位置情報を取得する THEN システム SHALL バックエンド経由でGeocoding APIを呼び出す
5. WHEN フロントエンドが住所から位置情報を取得する THEN システム SHALL APIキーをフロントエンドに露出しない
6. WHEN フロントエンドが住所から位置情報を取得する THEN システム SHALL 正規化された住所とPlace IDを返す

### Requirement 11: 画像処理とストレージ
**Objective:** As a システム, I want 店舗画像を効率的に処理・保存する, so that パフォーマンスを維持しつつ画像を表示できる

#### Acceptance Criteria
1. WHEN 店舗管理者が画像をアップロードする THEN システム SHALL クライアントサイドで画像を圧縮する
2. WHEN 画像が圧縮される THEN システム SHALL 最大800x600ピクセルにリサイズする
3. WHEN 画像が圧縮される THEN システム SHALL JPEG形式で品質80%で圧縮する
4. WHEN 圧縮された画像がサーバーに送信される THEN システム SHALL Base64エンコードしてデータベースに保存する
5. WHEN 画像が保存される THEN システム SHALL TEXT型カラムに保存する（VARCHAR(500)から拡張）
6. WHEN 画像がアップロードされる THEN システム SHALL 画像プレビューを即座に表示する

