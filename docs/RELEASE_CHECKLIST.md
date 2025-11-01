# Phase2 リリース作業チェックリスト

## 重要: 実行順序

mainブランチへのマージで**自動デプロイが開始**されます。
**デプロイ前に必ず以下を完了してください。**

---

## ステップ1: デプロイ前の準備（必須）

### 1.1 データベースマイグレーション実行

**RailwayのPostgreSQLに接続して、マイグレーションを実行してください。**

#### 接続方法
Railwayのダッシュボードから：
1. PostgreSQLデータベースサービスの「Connect」タブを開く
2. 「psql」コマンドをコピー
3. ローカルターミナルで実行

または、環境変数から接続情報を取得して：
```bash
psql $DATABASE_URL
```

#### マイグレーション実行順序
```sql
-- 1. 初期スキーマ（既に実行済みの場合はスキップ）
\i backend/database/migrations/001_initial_schema.sql

-- 2. 以降のマイグレーション（既存テーブルに追加）
\i backend/database/migrations/002_add_address_fields.sql
\i backend/database/migrations/003_add_staff_qr_columns.sql
\i backend/database/migrations/004_extend_image_url_column.sql
\i backend/database/migrations/006_add_users_table.sql
\i backend/database/migrations/007_add_reservations_table.sql
\i backend/database/migrations/008_add_push_subscriptions.sql
\i backend/database/migrations/009_add_shop_feature_settings.sql
\i backend/database/migrations/010_add_user_favorites.sql
\i backend/database/migrations/011_add_user_push_subscriptions.sql
```

#### または、個別にSQLを実行
```bash
# マイグレーションファイルの内容をコピーして、RailwayのPostgreSQLで実行
```

**確認事項:**
- [ ] 全マイグレーションが正常に完了
- [ ] エラーがないことを確認
- [ ] 新規テーブルが作成されている（`\dt` コマンドで確認）

### 1.2 環境変数の確認・設定

#### Railway（バックエンド）の環境変数
以下が設定されていることを確認：

```
DATABASE_URL=<Railway PostgreSQL接続文字列>
JWT_SECRET=<強力な秘密鍵>
VAPID_PUBLIC_KEY=<VAPID公開鍵>
VAPID_PRIVATE_KEY=<VAPID秘密鍵>
GOOGLE_MAPS_API_KEY=<Google Maps APIキー>
FRONTEND_URL=<フロントエンドURL（Vercel）>
NODE_ENV=production
PORT=3001
```

**VAPID鍵が未設定の場合:**
```bash
# ローカルでVAPID鍵を生成
npx web-push generate-vapid-keys

# 出力された公開鍵・秘密鍵をRailwayの環境変数に設定
```

#### Vercel（フロントエンド）の環境変数
以下が設定されていることを確認：

```
VITE_GOOGLE_MAPS_API_KEY=<Google Maps APIキー>
VITE_API_BASE_URL=<バックエンドAPI URL（Railway）>
```

**確認事項:**
- [ ] Railwayの環境変数が全て設定されている
- [ ] Vercelの環境変数が全て設定されている
- [ ] VAPID鍵が正しく設定されている

---

## ステップ2: Git操作

### 2.1 phase-2ブランチをリモートにプッシュ（確認用）

```bash
# 現在のブランチを確認
git branch

# phase-2ブランチをリモートにプッシュ
git push origin phase-2

# タグをプッシュ
git push origin v1.1.0
```

**目的:** リモートにバックアップし、他のメンバーが確認できるようにする

### 2.2 最終確認

デプロイ前に以下を再確認：
- [ ] データベースマイグレーションが完了
- [ ] 環境変数が正しく設定されている
- [ ] ビルドが正常に完了する（ローカルで確認済み）
- [ ] CHANGELOG.mdが作成されている
- [ ] バージョンが更新されている（1.1.0）

---

## ステップ3: デプロイ実行

### 3.1 mainブランチにマージ（自動デプロイ開始）

```bash
# mainブランチに切り替え
git checkout main

# phase-2ブランチをマージ
git merge phase-2

# mainブランチをプッシュ（これで自動デプロイが開始される）
git push origin main

# タグもプッシュ
git push origin v1.1.0
```

**注意:** このコマンド実行後、RailwayとVercelで自動デプロイが開始されます。

---

## ステップ4: デプロイ後の検証

### 4.1 デプロイ状況の確認

**Railway:**
- [ ] バックエンドサービスのデプロイが成功
- [ ] ビルドログにエラーがない
- [ ] アプリケーションが正常に起動

**Vercel:**
- [ ] フロントエンドのデプロイが成功
- [ ] ビルドログにエラーがない
- [ ] サイトが正常に表示される

### 4.2 基本機能の動作確認

#### 利用者アプリ
- [ ] トップページが表示される
- [ ] 店舗一覧が表示される
- [ ] 地図表示が正常に動作
- [ ] 店舗検索が正常に動作

#### 認証機能
- [ ] ユーザー登録が正常に動作
- [ ] ログインが正常に動作
- [ ] ログアウトが正常に動作
- [ ] 認証が必要なページへのアクセス制御が正常

#### 予約機能
- [ ] 予約作成が正常に動作
- [ ] 予約一覧が表示される
- [ ] 予約キャンセルが正常に動作

#### お気に入り機能
- [ ] お気に入り登録・解除が正常に動作
- [ ] お気に入り一覧が表示される

#### プッシュ通知
- [ ] 店舗管理者がプッシュ通知を購読できる
- [ ] 予約作成時に通知が届く
- [ ] 利用者がプッシュ通知を購読できる
- [ ] お気に入り店舗の空き状況変更時に通知が届く

#### 管理者機能
- [ ] システム管理者でログインできる
- [ ] 店舗管理が正常に動作
- [ ] 拡張機能設定が正常に動作
- [ ] 店舗管理者でログインできる
- [ ] 予約管理が正常に動作

#### PWA機能
- [ ] Service Workerが正常に登録される
- [ ] オフライン時に店舗一覧が表示される
- [ ] ホーム画面に追加できる

### 4.3 エラーログの確認

**Railway:**
- [ ] アプリケーションログに重大なエラーがない
- [ ] データベース接続エラーがない

**Vercel:**
- [ ] ビルドログにエラーがない
- [ ] ブラウザのコンソールにエラーがない

---

## ステップ5: GitHub Release作成

### 5.1 Releaseページで作成

1. GitHubリポジトリの「Releases」ページにアクセス
2. 「Draft a new release」をクリック
3. 以下を設定：
   - **Tag**: `v1.1.0`（既にプッシュ済み）
   - **Title**: `v1.1.0 - Phase2 Release`
   - **Description**: CHANGELOG.mdのv1.1.0セクションをコピー
4. 「Publish release」をクリック

---

## ロールバック手順（問題発生時）

デプロイ後に重大な問題が発生した場合：

### 1. デプロイのロールバック

**Railway:**
- デプロイ履歴から前のバージョンにロールバック

**Vercel:**
- デプロイ履歴から前のバージョンにロールバック

### 2. データベースのロールバック（必要に応じて）

新しいテーブルを削除（注意: データも削除されます）：
```sql
DROP TABLE IF EXISTS user_push_subscriptions CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS shop_feature_settings CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

---

## 完了後の記録

リリース完了後、以下を記録：

- [ ] リリース日時: __________
- [ ] デプロイ時間: __________
- [ ] 問題や注意事項: __________
- [ ] 次のPhaseに向けた課題: __________

