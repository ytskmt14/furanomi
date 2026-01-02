# 開発用ログイン情報

このドキュメントには、開発環境で使用するログイン情報とアクセス情報が記載されています。

## 開発環境URL

### フロントエンド
- **URL**: http://localhost:5173
- **利用者アプリ**: http://localhost:5173/user
- **店舗管理者アプリ**: http://localhost:5173/shop-manager
- **システム管理者アプリ**: http://localhost:5173/system-admin
- **スタッフ用アプリ**: http://localhost:5173/staff/availability

### バックエンド
- **API Base URL**: http://localhost:3001/api
- **Swagger UI** (開発環境のみ): http://localhost:3001/api-docs

## システム管理者

### デフォルトアカウント（`seed.sql`）

| 項目 | 値 |
|------|-----|
| **ユーザー名** | `admin` |
| **パスワード** | `admin123` |
| **メールアドレス** | `admin@furanomi.com` |
| **名前** | システム 管理者 |

### アクセス方法

1. ブラウザで http://localhost:5173/system-admin にアクセス
2. ログイン画面で上記の認証情報を入力
3. システム管理画面にアクセス可能

### 利用可能な機能

- 店舗の作成・編集・削除
- 店舗管理者の作成・編集・削除
- 店舗機能設定（予約機能のON/OFFなど）
- システム設定の管理

## 店舗管理者

### デフォルトアカウント（`seed.sql`）

以下の10個の店舗管理者アカウントが作成されます：

| ユーザー名 | パスワード | メールアドレス | 名前 | 電話番号 | 担当店舗 |
|-----------|-----------|--------------|------|---------|---------|
| `manager1` | `password0!` | `manager1@kashii.com` | 田中 太郎 | 092-1234-5678 | 居酒屋 香椎一番 |
| `manager2` | `password0!` | `manager2@kashii.com` | 佐藤 花子 | 092-2345-6789 | カフェ デリシャス |
| `manager3` | `password0!` | `manager3@kashii.com` | 鈴木 一郎 | 092-3456-7890 | イタリアンレストラン ラ・ベラ |
| `manager4` | `password0!` | `manager4@kashii.com` | 山田 二郎 | 092-4567-8901 | 焼肉 鶴の家 |
| `manager5` | `password0!` | `manager5@kashii.com` | 伊藤 三郎 | 092-5678-9012 | 寿司 海鮮太郎 |
| `manager6` | `password0!` | `manager6@kashii.com` | 加藤 四郎 | 092-6789-0123 | ラーメン 九州味 |
| `manager7` | `password0!` | `manager7@kashii.com` | 吉田 五郎 | 092-7890-1234 | 中華料理 福岡 |
| `manager8` | `password0!` | `manager8@kashii.com` | 高橋 六郎 | 092-8901-2345 | パン屋 ふくちゃん |
| `manager9` | `password0!` | `manager9@kashii.com` | 渡辺 七郎 | 092-9012-3456 | うどん さぬき |
| `manager10` | `password0!` | `manager10@kashii.com` | 中村 八郎 | 092-0123-4567 | 定食屋 さくら |

**注意**: すべての店舗管理者アカウントは同じパスワード `password0!` を使用します。

### アクセス方法

1. ブラウザで http://localhost:5173/shop-manager にアクセス
2. ログイン画面で上記の認証情報を入力
3. 店舗管理画面にアクセス可能

### 利用可能な機能

- 店舗情報の編集（店舗名、住所、営業時間など）
- 空き状況の更新
- 予約管理（承認・拒否）
- プッシュ通知設定
- 店舗機能設定の確認

## 利用者（一般ユーザー）

### アカウント作成

利用者アプリでは、新規登録機能を使用してアカウントを作成できます。

1. ブラウザで http://localhost:5173/user にアクセス
2. ヘッダーの「ログイン」ボタンをクリック
3. 「新規登録」タブでアカウントを作成

### 利用可能な機能

- 店舗検索（リスト表示・地図表示）
- 店舗のお気に入り登録
- 予約作成・管理
- プロフィール管理
- プッシュ通知設定（お気に入り店舗の空き状況変更通知）

## スタッフ用アクセス

### QRコード認証

スタッフはQRコードをスキャンして空き状況更新画面にアクセスできます。

1. 店舗管理者アプリでQRコードを生成
2. QRコードをスキャン
3. パスコードを入力して空き状況を更新

**URL形式**: `http://localhost:5173/staff/availability?token=<QRコードトークン>`

## 環境変数

### フロントエンド（`.env.local`）

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:3001/api
```

### バックエンド（`.env`）

```env
DATABASE_URL=postgresql://username:password@localhost:5432/furanomi
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3001
```

### プッシュ通知（オプション）

```env
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@furanomi.com
```

## データベース初期化

開発環境のデータベースを初期化するには：

```bash
cd backend
npm run db:init
npm run db:seed
```

これにより、上記のシステム管理者と店舗管理者アカウントが作成されます。

## 注意事項

⚠️ **セキュリティ警告**

- これらの認証情報は**開発環境専用**です
- 本番環境では絶対に使用しないでください
- 本番環境では初回ログイン後に必ずパスワードを変更してください
- 認証情報をGitにコミットしないでください（`.gitignore`で除外されています）

## トラブルシューティング

### ログインできない場合

1. **データベースが初期化されているか確認**
   ```bash
   cd backend
   npm run db:init
   npm run db:seed
   ```

2. **バックエンドサーバーが起動しているか確認**
   ```bash
   cd backend
   npm run dev
   ```

3. **フロントエンドサーバーが起動しているか確認**
   ```bash
   cd frontend
   npm run dev
   ```

4. **ブラウザのコンソールでエラーを確認**
   - 開発者ツール（F12）を開く
   - Consoleタブでエラーメッセージを確認

### パスワードを忘れた場合

データベースをリセットして再初期化：

```bash
cd backend
npm run db:reset
```

**注意**: `db:reset`は全テーブルを削除してからスキーマ作成と初期データ投入まで自動的に実行します。

## 更新履歴

- 2025-01-XX: 初版作成

