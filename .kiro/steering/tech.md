# 技術スタック

## アーキテクチャ概要

**ふらのみ**は、フロントエンドとバックエンドが分離されたモノレポ構成のWebアプリケーションです。PWA対応により、ネイティブアプリライクな体験を提供します。

```
┌─────────────────┐
│   Frontend      │  React 19 + TypeScript + Vite
│   (Vercel)      │  PWA (Service Worker)
└────────┬────────┘
         │ HTTPS
         │ REST API
┌────────▼────────┐
│   Backend       │  Node.js + Express + TypeScript
│   (Railway)     │  PostgreSQL
└─────────────────┘
```

## フロントエンド

### コア技術
- **React**: 19.1.1 - UIライブラリ
- **TypeScript**: ~5.9.3 - 型安全性
- **Vite**: ^7.1.7 - ビルドツール・開発サーバー
- **React Router**: ^7.9.4 - ルーティング

### UI/スタイリング
- **Tailwind CSS**: ^3.4.18 - ユーティリティファーストCSS
- **Radix UI**: 
  - `@radix-ui/react-slot`: ^1.2.3
  - `@radix-ui/react-toast`: ^1.2.15
- **Lucide React**: ^0.546.0 - アイコンライブラリ
- **class-variance-authority**: ^0.7.1 - コンポーネントバリアント管理
- **clsx**: ^2.1.1 - 条件付きクラス名
- **tailwind-merge**: ^3.3.1 - Tailwindクラス名のマージ

### 状態管理・データフェッチ
- **TanStack React Query**: ^5.90.7 - サーバー状態管理・キャッシング

### 地図機能
- **Google Maps JavaScript API**: v3 - 地図表示
- **@googlemaps/js-api-loader**: ^2.0.1 - Google Maps APIローダー
- **@types/google.maps**: ^3.58.1 - TypeScript型定義

### PWA機能
- **vite-plugin-pwa**: ^1.1.0 - PWAプラグイン
- **workbox-window**: ^7.3.0 - Service Worker管理

### その他
- **qrcode.react**: ^4.2.0 - QRコード生成

### 開発ツール
- **ESLint**: ^9.36.0 - リンター
- **Prettier**: ^3.6.2 - コードフォーマッター
- **TypeScript ESLint**: ^8.45.0 - TypeScript用ESLint

### ビルド設定
- **Terser**: ^5.44.0 - コード圧縮
- **PostCSS**: ^8.5.6 - CSS処理
- **Autoprefixer**: ^10.4.21 - ベンダープレフィックス自動追加

## バックエンド

### コア技術
- **Node.js**: LTS版推奨
- **Express**: ^5.1.0 - Webフレームワーク
- **TypeScript**: ^5.9.3 - 型安全性
- **ts-node**: ^10.9.2 - TypeScript実行環境

### データベース
- **PostgreSQL**: リレーショナルデータベース
- **pg**: ^8.16.3 - PostgreSQLクライアント
- **接続プール設定**:
  - 最小接続数: 2
  - 最大接続数: 10
  - アイドルタイムアウト: 10秒
  - 接続タイムアウト: 5秒
  - TCP Keep-Alive有効

### 認証・セキュリティ
- **JWT (jsonwebtoken)**: ^9.0.2 - トークンベース認証
- **bcryptjs**: ^3.0.2 - パスワードハッシュ化
- **cookie-parser**: ^1.4.7 - Cookie解析
- **CORS**: ^2.8.5 - クロスオリジンリソース共有

### 外部API統合
- **Google Maps Geocoding API**: 住所から位置情報取得
- **zipcloud API**: 郵便番号から住所取得
- **Web Push API**: プッシュ通知送信（web-push: ^3.6.7）

### ミドルウェア・ユーティリティ
- **compression**: ^1.8.1 - Gzip圧縮
- **dotenv**: ^17.2.3 - 環境変数管理

### API仕様
- **Swagger/OpenAPI 3.0**: API仕様書（開発環境のみ）
- **swagger-ui-express**: ^5.0.0 - Swagger UI
- **yamljs**: ^0.3.0 - YAML解析

### 開発ツール
- **nodemon**: ^3.1.10 - 開発時の自動再起動

## 開発環境

### 必要なツール
- **Node.js**: LTS版（v18以上推奨）
- **npm**: Node.jsに同梱
- **PostgreSQL**: ローカル開発用（またはRailway等のクラウドサービス）

### 環境変数

#### フロントエンド (`.env.local`)
```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:3001/api
```

#### バックエンド (`.env`)
```bash
# データベース
DATABASE_URL=postgresql://username:password@localhost:5432/furanomi
# または個別設定
DB_HOST=localhost
DB_PORT=5432
DB_NAME=furanomi
DB_USER=postgres
DB_PASSWORD=password

# 認証
JWT_SECRET=your_jwt_secret

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# フロントエンドURL
FRONTEND_URL=http://localhost:5173

# 環境
NODE_ENV=development

# ポート
PORT=3001

# Web Push (VAPID鍵)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

## デプロイ環境

### フロントエンド
- **プラットフォーム**: Vercel
- **ビルドコマンド**: `cd frontend && npm run build`
- **出力ディレクトリ**: `frontend/dist`
- **環境変数**: Vercelダッシュボードで設定

### バックエンド
- **プラットフォーム**: Railway
- **データベース**: Railway PostgreSQL
- **起動コマンド**: `npm start`
- **環境変数**: Railwayダッシュボードで設定

## ポート設定

### 開発環境
- **フロントエンド**: `http://localhost:5173` (Viteデフォルト)
- **バックエンド**: `http://localhost:3001` (環境変数`PORT`で変更可能)
- **Swagger UI**: `http://localhost:3001/api-docs` (開発環境のみ)
- **パフォーマンス統計**: `http://localhost:3001/performance` (開発環境のみ)

### 本番環境
- **フロントエンド**: Vercelが自動割り当て
- **バックエンド**: Railwayが自動割り当て

## よく使うコマンド

### フロントエンド
```bash
cd frontend

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー（ビルド後の確認）
npm run preview

# リンター実行
npm run lint

# リンター自動修正
npm run lint:fix

# コードフォーマット
npm run format
```

### バックエンド
```bash
cd backend

# 開発サーバー起動（自動再起動付き）
npm run dev

# ビルド
npm run build

# 本番起動
npm start

# リンター実行
npm run lint

# リンター自動修正
npm run lint:fix

# コードフォーマット
npm run format

# データベース初期化
npm run db:init

# データベースリセット
npm run db:reset

# マイグレーション実行
npm run db:migrate
```

## アーキテクチャパターン

### フロントエンド
- **コンポーネント設計**: 関数コンポーネント + Hooks
- **状態管理**: React Context API + TanStack React Query
- **ルーティング**: React Router v7
- **スタイリング**: Tailwind CSS（ユーティリティファースト）
- **型安全性**: TypeScript厳格モード

### バックエンド
- **API設計**: RESTful API
- **認証**: JWT + HTTP-only cookies
- **データベース**: PostgreSQL（正規化されたリレーショナル設計）
- **エラーハンドリング**: 統一されたエラーハンドラーミドルウェア
- **パフォーマンス**: 接続プール、Gzip圧縮、キャッシング

### データベース
- **接続管理**: 接続プール（pg.Pool）
- **マイグレーション**: SQLファイルベース
- **シードデータ**: SQLファイルベース

## セキュリティ考慮事項

### APIキー管理
- **フロントエンド用Google Maps APIキー**: HTTP referer制限で保護
- **バックエンド用Google Maps APIキー**: IP制限なし（Geocoding API用）
- **JWT Secret**: 環境変数で管理、本番環境では強力なランダム文字列を使用

### 認証・認可
- **JWT**: HTTP-only cookiesで保存（XSS対策）
- **パスワード**: bcryptjsでハッシュ化
- **CORS**: 許可されたオリジンのみアクセス可能

### データ保護
- **SQLインジェクション対策**: パラメータ化クエリ（pg）
- **XSS対策**: Reactの自動エスケープ
- **CSRF対策**: SameSite Cookie属性

## パフォーマンス最適化

### フロントエンド
- **コード分割**: Viteの自動コード分割 + 手動チャンク分割
- **画像最適化**: クライアントサイド圧縮（最大800x600、JPEG品質80%）
- **PWAキャッシング**: Service Workerによる静的アセットキャッシング
- **遅延読み込み**: React.lazy + Suspense

### バックエンド
- **接続プール**: データベース接続の再利用
- **Gzip圧縮**: レスポンスの圧縮
- **パフォーマンス監視**: ミドルウェアによるリクエスト時間計測
- **キャッシング**: 頻繁にアクセスされるデータのキャッシング（将来実装）

## 外部依存関係

### 必須サービス
- **Google Maps Platform**: 地図表示・Geocoding
- **zipcloud API**: 郵便番号検索（無料）

### オプションサービス
- **Vercel**: フロントエンドホスティング
- **Railway**: バックエンド・データベースホスティング

