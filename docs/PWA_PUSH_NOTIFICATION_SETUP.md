# PWAプッシュ通知セットアップガイド

## 概要

このドキュメントでは、Phase 2リリース時に必要なPWAプッシュ通知機能のセットアップ手順を説明します。

## 必要な作業

### 1. VAPID鍵の生成

プッシュ通知を送信するには、VAPID鍵の生成が必要です。

#### 鍵の生成コマンド

```bash
# Node.jsがインストールされている環境で実行
npx web-push generate-vapid-keys
```

#### 出力例

```
Public Key:
BBE1fJhGK7KvPKBKp1L7V3XqG4K8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J

Private Key:
XYz9aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmN

Generated email: admin@example.com
```

### 2. 環境変数の設定

生成したVAPID鍵を環境変数として設定します。

#### ローカル環境（.env）

プロジェクトルートの `.env` ファイルに以下を追加：

```env
# VAPID鍵設定
VAPID_PUBLIC_KEY=BBE1fJhGK7KvPKBKp1L7V3XqG4K8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J
VAPID_PRIVATE_KEY=XYz9aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmN
VAPID_EMAIL=mailto:admin@furanomi.com
```

#### 本番環境（Vercel/その他のホスティング）

各ホスティングサービスの環境変数設定画面で以下を追加：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `VAPID_PUBLIC_KEY` | 公開鍵 | フロントエンドで使用 |
| `VAPID_PRIVATE_KEY` | 秘密鍵 | バックエンドでのみ使用 |
| `VAPID_EMAIL` | `mailto:admin@furanomi.com` | 管理者メール |

### 3. データベースマイグレーション

プッシュ通知の購読情報を保存するテーブルを作成します。

```bash
# マイグレーションファイルを実行
cd backend
psql -U your_db_user -d your_db_name -f database/migrations/005_add_push_subscriptions.sql
```

または、Node.jsのスクリプトで実行：

```bash
cd backend
npm run db:migrate
```

### 4. 依存関係のインストール

バックエンドに `web-push` パッケージを追加します（すでにインストール済み）。

```bash
cd backend
npm install
```

### 5. 動作確認

#### 5.1 バックエンドの動作確認

```bash
cd backend
npm run build
npm start
```

VAPID公開鍵が取得できることを確認：

```bash
curl http://localhost:3001/api/notifications/vapid-public-key
```

#### 5.2 フロントエンドの動作確認

```bash
cd frontend
npm run build
npm run preview
```

1. 利用者アプリ（`/user`）にアクセス
2. 右下の「通知OFF」ボタンをクリック
3. 通知許可ダイアログが表示されることを確認
4. 許可すると「通知ON」に変わることを確認

#### 5.3 プッシュ通知のテスト

1. 別ウィンドウで店舗管理画面にアクセス
2. 店舗の空き状況を更新
3. 利用者アプリ側に通知が届くことを確認

## トラブルシューティング

### 通知が届かない場合

1. **VAPID鍵の設定確認**
   ```bash
   # バックエンドのログを確認
   # VAPID key not configured というエラーが出ていないか
   ```

2. **Service Workerの確認**
   - ブラウザの開発者ツール → Application → Service Workers
   - Service Workerが登録されているか確認

3. **ブラウザの通知設定**
   - 通知許可が有効になっているか確認

### 購読情報が保存されない場合

1. データベース接続の確認
2. `push_subscriptions` テーブルが作成されているか確認
   ```sql
   SELECT * FROM push_subscriptions;
   ```

### HTTPSが必要

プッシュ通知は HTTPS 環境でのみ動作します。

- ローカル開発: `localhost` では HTTP でも動作
- 本番環境: HTTPS 必須

## セキュリティ注意事項

⚠️ **VAPID_PRIVATE_KEYは絶対に公開しないでください**

- GitHub へのコミット禁止
- `.gitignore` に `.env` が含まれていることを確認
- 本番環境の環境変数は適切に管理

## Phase 2リリースチェックリスト

- [ ] VAPID鍵を生成
- [ ] 環境変数を設定（本番環境）
- [ ] データベースマイグレーション実行
- [ ] バックエンドのビルド・デプロイ
- [ ] フロントエンドのビルド・デプロイ
- [ ] 動作確認（通知許可、通知受信）

## 参考リンク

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push documentation](https://github.com/web-push-libs/web-push)
- [VAPID Protocol](https://tools.ietf.org/html/rfc8292)

