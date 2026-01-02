# プロジェクト構造

## ルートディレクトリ構成

```
furanomi/
├── frontend/          # フロントエンドアプリケーション
├── backend/           # バックエンドAPIサーバー
├── openspec/          # OpenSpec仕様書・変更提案
├── docs/              # プロジェクトドキュメント
├── .kiro/             # Kiroステアリングドキュメント
├── README.md          # プロジェクト概要
├── CHANGELOG.md       # 変更履歴
└── vercel.json        # Vercel設定
```

## フロントエンド構造 (`frontend/`)

### ディレクトリ構成
```
frontend/
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── auth/          # 認証関連コンポーネント
│   │   ├── common/        # 共通コンポーネント
│   │   ├── landing/       # ランディングページ
│   │   ├── reservation/   # 予約関連コンポーネント
│   │   ├── shop/          # 店舗表示コンポーネント
│   │   ├── shopManager/   # 店舗管理者画面
│   │   ├── staff/         # スタッフ画面
│   │   ├── systemAdmin/   # システム管理者画面
│   │   ├── user/          # ユーザー機能
│   │   └── ui/            # UIプリミティブ（shadcn/ui）
│   ├── contexts/          # React Context
│   ├── hooks/             # カスタムフック
│   ├── services/          # APIクライアント
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ユーティリティ関数
│   ├── lib/               # ライブラリ設定
│   ├── constants/         # 定数定義
│   ├── assets/            # 静的アセット
│   ├── App.tsx            # ルートコンポーネント
│   ├── main.tsx           # エントリーポイント
│   ├── index.css          # グローバルスタイル
│   └── sw.ts              # Service Worker
├── public/                # 静的ファイル
├── dist/                  # ビルド出力
├── package.json
├── vite.config.ts         # Vite設定
├── tailwind.config.js     # Tailwind CSS設定
├── tsconfig.json          # TypeScript設定
└── vercel.json            # Vercel設定
```

### コンポーネント組織パターン

#### 機能別ディレクトリ
- **auth/**: 認証関連（LoginModal, RegisterModal, ProtectedRoute, UserProfile）
- **shop/**: 店舗表示（ShopCard, ShopDetail, AvailabilityBadge, DistanceDisplay）
- **shopManager/**: 店舗管理者機能（ShopManagerApp, ShopInfoEdit, AvailabilityUpdate）
- **systemAdmin/**: システム管理者機能（SystemAdminApp, ShopsManagement, ManagersManagement）
- **reservation/**: 予約機能（CreateReservationModal, MyReservations）
- **user/**: ユーザー機能（UserPushNotificationSettings）

#### UIプリミティブ (`ui/`)
shadcn/uiベースの再利用可能なコンポーネント:
- `button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `toast.tsx` など

#### 共通コンポーネント (`common/`)
- `forms/`: フォーム関連（FormField, FormSelect, FormTextarea）

### ファイル命名規則
- **コンポーネント**: PascalCase（例: `ShopCard.tsx`）
- **フック**: camelCase with `use` prefix（例: `useFavorites.ts`）
- **ユーティリティ**: camelCase（例: `helpers.ts`）
- **型定義**: camelCase（例: `api.ts`）

### インポート組織
```typescript
// 1. 外部ライブラリ
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 内部モジュール（絶対パス）
import { api } from '@/services/api';
import { ShopCard } from '@/components/shop/ShopCard';

// 3. 相対パス
import { useShopInfo } from './hooks/useShopInfo';
```

## バックエンド構造 (`backend/`)

### ディレクトリ構成
```
backend/
├── src/
│   ├── routes/            # APIルート定義
│   │   ├── auth.ts        # 認証（システム管理者・店舗管理者）
│   │   ├── userAuth.ts    # ユーザー認証
│   │   ├── shops.ts       # 店舗管理
│   │   ├── availability.ts # 空き状況
│   │   ├── staff.ts       # スタッフアクセス
│   │   ├── system.ts      # システム設定
│   │   ├── reservations.ts # 予約管理
│   │   ├── notifications.ts # 通知管理
│   │   ├── userNotifications.ts # ユーザー通知
│   │   ├── userFavorites.ts # お気に入り
│   │   └── shopFeatures.ts # 店舗機能設定
│   ├── middleware/        # Expressミドルウェア
│   │   ├── auth.ts        # JWT認証
│   │   ├── errorHandler.ts # エラーハンドリング
│   │   └── performance.ts # パフォーマンス監視
│   ├── config/            # 設定ファイル
│   │   └── database.ts    # データベース接続
│   ├── types/             # TypeScript型定義
│   │   └── database.ts    # データベース型
│   ├── utils/             # ユーティリティ関数
│   │   ├── cache.ts       # キャッシング
│   │   └── nameUtils.ts   # 名前処理
│   └── index.ts           # エントリーポイント
├── database/
│   ├── migrations/        # データベースマイグレーション
│   ├── schema.sql         # スキーマ定義
│   ├── seed.sql           # シードデータ
│   └── README.md          # データベースドキュメント
├── migrations/            # 追加マイグレーション
├── scripts/               # スクリプト
│   └── init-db.js         # データベース初期化
├── dist/                  # ビルド出力
├── swagger.yaml           # OpenAPI仕様書
├── package.json
└── tsconfig.json          # TypeScript設定
```

### ルート組織パターン

#### RESTful API設計
- **GET /api/shops**: 店舗一覧取得
- **GET /api/shops/:id**: 店舗詳細取得
- **POST /api/shops**: 店舗作成（システム管理者）
- **PUT /api/shops/:id**: 店舗更新
- **DELETE /api/shops/:id**: 店舗削除（システム管理者）

#### 認証ルート
- `/api/auth/*`: システム管理者・店舗管理者認証
- `/api/user-auth/*`: 一般ユーザー認証

#### 機能別ルート
- `/api/availability/*`: 空き状況管理
- `/api/staff/*`: スタッフアクセス
- `/api/reservations/*`: 予約管理
- `/api/user/notifications/*`: ユーザー通知
- `/api/user/favorites/*`: お気に入り

### ミドルウェア階層
1. **compression**: Gzip圧縮
2. **performanceMiddleware**: パフォーマンス監視
3. **cors**: CORS設定
4. **cookieParser**: Cookie解析
5. **express.json**: JSON解析
6. **authenticateToken**: JWT認証（保護ルート）
7. **errorHandler**: エラーハンドリング

### ファイル命名規則
- **ルート**: camelCase（例: `shops.ts`）
- **ミドルウェア**: camelCase（例: `auth.ts`）
- **ユーティリティ**: camelCase（例: `cache.ts`）
- **型定義**: camelCase（例: `database.ts`）

## データベース構造 (`backend/database/`)

### マイグレーションファイル
- `001_initial_schema.sql`: 初期スキーマ
- `002_add_address_fields.sql`: 住所フィールド追加
- `003_add_staff_qr_columns.sql`: スタッフQRコード機能
- `007_add_reservations_table.sql`: 予約テーブル
- `008_add_push_subscriptions.sql`: プッシュ通知
- `009_add_shop_feature_settings.sql`: 店舗機能設定
- `010_add_user_favorites.sql`: お気に入り
- `011_add_user_push_subscriptions.sql`: ユーザープッシュ通知

### 主要テーブル
- **shops**: 店舗情報
- **shop_managers**: 店舗管理者
- **system_admins**: システム管理者
- **users**: 一般ユーザー
- **reservations**: 予約
- **user_favorites**: お気に入り
- **push_subscriptions**: プッシュ通知購読
- **shop_feature_settings**: 店舗機能設定

## OpenSpec構造 (`openspec/`)

### ディレクトリ構成
```
openspec/
├── AGENTS.md              # AIエージェント向けガイドライン
├── project.md             # プロジェクトコンテキスト
├── backlog.md             # 開発バックログ
├── specs/                 # 確定仕様書
│   ├── api/               # API仕様
│   ├── database/          # データベース仕様
│   ├── user-app/          # ユーザーアプリ仕様
│   ├── shop-management/   # 店舗管理仕様
│   └── system-admin/      # システム管理仕様
└── changes/               # 変更提案
    ├── add-pwa-support/   # PWA対応提案
    ├── add-reservation-system/ # 予約システム提案
    └── archive/           # アーカイブ済み提案
```

## ドキュメント構造 (`docs/`)

### 主要ドキュメント
- `GITHUB_BRANCH_PROTECTION_SETUP.md`: GitHubブランチ保護設定
- `PWA_INSTALL_SAFARI.md`: Safari PWAインストールガイド
- `PWA_PUSH_NOTIFICATION_SETUP.md`: プッシュ通知設定ガイド
- `PUSH_NOTIFICATION_TEST_GUIDE.md`: プッシュ通知テストガイド
- `RELEASE_CHECKLIST.md`: リリースチェックリスト

## コード組織の原則

### 関心の分離
- **コンポーネント**: UI表示とユーザーインタラクション
- **フック**: 状態管理と副作用
- **サービス**: API通信
- **ユーティリティ**: 純粋関数・ヘルパー

### 再利用性
- **UIプリミティブ**: `ui/`ディレクトリで一元管理
- **共通コンポーネント**: `common/`ディレクトリ
- **カスタムフック**: `hooks/`ディレクトリ

### 型安全性
- **型定義**: `types/`ディレクトリで一元管理
- **データベース型**: `backend/src/types/database.ts`
- **API型**: `frontend/src/types/`で定義

### 設定の一元化
- **環境変数**: `.env`ファイル（gitignore）
- **定数**: `constants/`ディレクトリ
- **設定ファイル**: `config/`ディレクトリ

## インポートパスエイリアス

### フロントエンド (`vite.config.ts`)
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

使用例:
```typescript
import { api } from '@/services/api';
import { ShopCard } from '@/components/shop/ShopCard';
```

### バックエンド
相対パスを使用（TypeScriptのパスエイリアスは未設定）

## ビルド出力

### フロントエンド (`frontend/dist/`)
- `index.html`: エントリーポイント
- `assets/`: バンドルされたJS/CSS
- `sw.js`: Service Worker
- `manifest.json`: PWAマニフェスト

### バックエンド (`backend/dist/`)
- `index.js`: エントリーポイント
- `routes/`: コンパイルされたルート
- `middleware/`: コンパイルされたミドルウェア
- `config/`: コンパイルされた設定

## Git管理

### ブランチ戦略
- **main**: 本番環境（リリース済みコード）
- **phase-{N}**: Phase統合ブランチ（例: `phase-2`）
- **feature/{機能名}**: 機能開発ブランチ

### コミットメッセージ
- `feat:`: 新機能
- `fix:`: バグ修正
- `docs:`: ドキュメント
- `refactor:`: リファクタリング

### 除外ファイル (`.gitignore`)
- `node_modules/`
- `dist/`
- `.env`
- `.env.local`
- `.DS_Store`

