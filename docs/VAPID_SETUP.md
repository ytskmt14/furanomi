# VAPIDキー設定ガイド

プッシュ通知機能を使用するには、VAPID（Voluntary Application Server Identification）キーを生成して設定する必要があります。

## VAPIDキーとは

VAPIDキーは、Web Push通知を送信するために必要な公開鍵と秘密鍵のペアです。これにより、サーバーがプッシュ通知を送信する際に、正当な送信元であることを証明できます。

## VAPIDキーの生成方法

### 方法1: web-pushライブラリを使用（推奨）

1. **web-pushをインストール**（グローバルまたはプロジェクトローカル）
```bash
npm install -g web-push
# または
cd backend
npm install web-push
```

2. **VAPIDキーを生成**
```bash
web-push generate-vapid-keys
```

出力例：
```
=======================================

Public Key:
BEl62iUYgUivxIkvpYFkQmYUxUrv7rDWLk-8VbvhKghl
xKzNylkFYcy1tT3Q8yZ8xOuxVG3j_8bZU3q1N2o

Private Key:
8KYx5kFmYUxUrv7rDWLk-8VbvhKghlxKzNylkFYcy1tT3Q8yZ8xOuxVG3j_8bZU3q1N2o

=======================================
```

### 方法2: Node.jsスクリプトを使用

`backend`ディレクトリで以下のコマンドを実行：

```bash
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public Key:', keys.publicKey); console.log('Private Key:', keys.privateKey);"
```

## 環境変数の設定

生成したVAPIDキーをバックエンドの`.env`ファイルに設定します。

### 開発環境（`backend/.env`）

```env
# プッシュ通知（VAPIDキー）
VAPID_PUBLIC_KEY=あなたの公開鍵
VAPID_PRIVATE_KEY=あなたの秘密鍵
```

**例：**
```env
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkvpYFkQmYUxUrv7rDWLk-8VbvhKghlxKzNylkFYcy1tT3Q8yZ8xOuxVG3j_8bZU3q1N2o
VAPID_PRIVATE_KEY=8KYx5kFmYUxUrv7rDWLk-8VbvhKghlxKzNylkFYcy1tT3Q8yZ8xOuxVG3j_8bZU3q1N2o
```

### 本番環境（Railwayなど）

デプロイプラットフォームの環境変数設定画面で以下を設定：

- `VAPID_PUBLIC_KEY`: 公開鍵
- `VAPID_PRIVATE_KEY`: 秘密鍵

## 設定後の確認

1. **バックエンドサーバーを再起動**
```bash
cd backend
npm run dev
```

2. **店舗管理画面で確認**
   - 設定画面にアクセス
   - 「通知を有効にする」ボタンをクリック
   - エラーが表示されなければ設定成功

## トラブルシューティング

### エラー: "VAPID公開鍵が設定されていません"

**原因**: 環境変数が正しく設定されていない、またはバックエンドサーバーが再起動されていない

**解決方法**:
1. `backend/.env`ファイルにVAPIDキーが設定されているか確認
2. バックエンドサーバーを再起動
3. 環境変数にスペースや改行が含まれていないか確認

### エラー: "購読失敗" / "Registration failed - permission denied"

**原因**: 
- ブラウザが通知を許可していない
- Service Workerが登録されていない
- HTTPS接続でない（本番環境）
- ブラウザの通知設定でサイトが拒否されている

**解決方法**:

1. **ブラウザの通知許可設定を確認**
   - Chrome/Edge: アドレスバーの左側の🔒アイコンをクリック → 「通知」を「許可」に設定
   - Safari: 環境設定 → ウェブサイト → 通知 → サイトを「許可」に設定
   - Firefox: アドレスバーの左側のアイコンをクリック → 「通知」を「許可」に設定

2. **サイトの通知設定をリセット**
   - ブラウザの設定で、このサイトの通知設定を「ブロック」から「許可」に変更
   - または、サイトのデータをクリアして再度許可をリクエスト

3. **ページをリロード**
   - 設定変更後、ページを完全にリロード（Ctrl+Shift+R または Cmd+Shift+R）

4. **Service Workerの確認**
   - ブラウザの開発者ツール（F12）→ Application → Service Workers で登録状態を確認
   - 未登録の場合は、ページをリロード

5. **本番環境ではHTTPS接続を使用**
   - プッシュ通知はHTTPS接続（またはlocalhost）でのみ動作します

## セキュリティ注意事項

⚠️ **重要**:
- `VAPID_PRIVATE_KEY`は**絶対に公開しないでください**
- `.env`ファイルは`.gitignore`に含まれていることを確認
- 本番環境では定期的にキーを再生成することを推奨
- キーを漏洩した場合は、すぐに再生成してください

## 参考リンク

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [web-push ライブラリ](https://github.com/web-push-libs/web-push)
- [VAPID仕様](https://tools.ietf.org/html/rfc8292)

