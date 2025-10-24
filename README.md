# ふらのみ (Furanomi)

近くのお店の空き状況をチェックできるWebアプリケーション

## 概要

ふらのみは、ユーザーが近くのお店の空き状況をリアルタイムで確認できるサービスです。
店舗管理者は空き状況を更新でき、システム管理者は店舗と店舗管理者を管理できます。

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Maps API

### バックエンド
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT認証

### デプロイ
- Vercel (フロントエンド)
- Railway (バックエンド + データベース)

## セットアップ

### 開発環境

1. リポジトリをクローン
```bash
git clone https://github.com/ytskmt14/furanomi.git
cd furanomi
```

2. フロントエンドの依存関係をインストール
```bash
cd frontend
npm install
```

3. バックエンドの依存関係をインストール
```bash
cd ../backend
npm install
```

4. 環境変数を設定
```bash
# frontend/.env.local
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:3001/api

# backend/.env
DATABASE_URL=postgresql://username:password@localhost:5432/furanomi
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FRONTEND_URL=http://localhost:5173
```

5. データベースをセットアップ
```bash
cd backend
npm run db:init
npm run db:seed
```

6. 開発サーバーを起動
```bash
# フロントエンド
cd frontend
npm run dev

# バックエンド
cd backend
npm run dev
```

### デプロイ

#### Vercel (フロントエンド)
1. Vercelアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ

#### Railway (バックエンド)
1. Railwayアカウントを作成
2. PostgreSQLデータベースを追加
3. バックエンドサービスを追加
4. 環境変数を設定
5. デプロイ

## 機能

### ユーザーアプリ
- 近くのお店の検索
- 地図表示とリスト表示
- 店舗の詳細情報表示
- 空き状況の確認

### 店舗管理者アプリ
- ログイン/ログアウト
- 店舗情報の編集
- 空き状況の更新
- QRコードによるスタッフアクセス

### システム管理者アプリ
- ログイン/ログアウト
- 店舗の管理（作成・編集・削除）
- 店舗管理者の管理
- システム設定

## API仕様書

API仕様書はSwagger/OpenAPI 3.0形式で提供されています。

### 開発環境
Swagger UIで仕様書を閲覧・テスト：
```
http://localhost:3001/api-docs
```

**注意**: Swagger UIは開発環境（`NODE_ENV=development`）でのみ利用可能です。本番環境では無効化されています。

### ファイル
- `backend/swagger.yaml` - OpenAPI 3.0形式の仕様書

### 主要エンドポイント
- **認証**: `/api/auth/*` - ログイン/ログアウト
- **店舗**: `/api/shops/*` - 店舗情報の取得・管理
- **空き状況**: `/api/availability/*` - 空き状況の取得・更新
- **スタッフアクセス**: `/api/staff/*` - QRコード機能
- **システム管理**: `/api/system/*` - システム設定・統計
- **Geocoding**: `/api/geocoding` - 住所から位置情報取得

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
