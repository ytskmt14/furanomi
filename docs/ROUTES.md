# 画面一覧（URLリスト）

このドキュメントは、ふらのみアプリケーションの全画面（ルート）の一覧です。

## 利用者用アプリ

| URL | 説明 | 認証 | 備考 |
|-----|------|------|------|
| `/user` | 店舗検索（リスト/地図表示） | 不要 | デフォルトはリスト表示、地図表示に切り替え可能 |
| `/user/profile` | プロフィール | 必須 | ユーザー情報の確認・編集 |
| `/user/reservations` | マイ予約 | 必須 | 予約一覧の確認・管理 |
| `/user/debug/sw` | Service Worker デバッグ画面 | 不要 | 開発・デバッグ用 |

### ルーティング設定
- ファイル: `frontend/src/App.tsx`
- デフォルトルート (`/`) は `/user` にリダイレクト

## 店舗管理者用アプリ

ベースパス: `/shop-manager/*`

| URL | 説明 | 認証 | 備考 |
|-----|------|------|------|
| `/shop-manager/login` | ログイン | 不要 | 店舗管理者認証 |
| `/shop-manager/` | ダッシュボード | 必須 | 店舗管理のトップページ |
| `/shop-manager/shop` | 店舗情報編集 | 必須 | 店舗名、住所、営業時間などの編集 |
| `/shop-manager/availability` | 空き状況更新 | 必須 | リアルタイム空き状況の更新 |
| `/shop-manager/reservations` | 予約管理 | 必須 | 予約の確認・承認・拒否 |
| `/shop-manager/settings` | 設定 | 必須 | 店舗機能設定など |

### ルーティング設定
- ファイル: `frontend/src/components/shopManager/ShopManagerApp.tsx`
- デフォルトは `/shop-manager/login` にリダイレクト

## システム管理者用アプリ

ベースパス: `/system-admin/*`

| URL | 説明 | 認証 | 備考 |
|-----|------|------|------|
| `/system-admin/login` | ログイン | 不要 | システム管理者認証 |
| `/system-admin/` | ダッシュボード | 必須 | システム管理のトップページ |
| `/system-admin/shops` | 店舗管理 | 必須 | 店舗の作成・編集・削除 |
| `/system-admin/managers` | 店舗管理者管理 | 必須 | 店舗管理者の作成・編集・削除 |
| `/system-admin/settings` | システム設定 | 必須 | システム全体の設定 |

### ルーティング設定
- ファイル: `frontend/src/components/systemAdmin/SystemAdminApp.tsx`

## スタッフ用アプリ

| URL | 説明 | 認証 | 備考 |
|-----|------|------|------|
| `/staff/availability` | 空き状況更新 | QRコード認証 | スタッフがQRコードでアクセスして空き状況を更新 |

### ルーティング設定
- ファイル: `frontend/src/App.tsx`

## 認証について

### 認証不要
- 利用者用店舗検索 (`/user`)
- 各管理画面のログインページ

### 認証必須
- 利用者用プロフィール・予約画面 (`/user/profile`, `/user/reservations`)
- 店舗管理者用全画面（ログイン除く）
- システム管理者用全画面（ログイン除く）

### 認証方式
- **利用者**: JWT認証（`/api/user-auth/*`）
- **店舗管理者**: JWT認証（`/api/auth/*`）
- **システム管理者**: JWT認証（`/api/auth/*`）
- **スタッフ**: QRコード認証（`/api/staff/*`）

## コード分割（Code Splitting）

以下のコンポーネントは遅延ロード（lazy loading）されています：

- `ShopManagerApp` - 店舗管理者用アプリ
- `SystemAdminApp` - システム管理者用アプリ
- `StaffAvailabilityUpdate` - スタッフ用空き状況更新
- `MyReservations` - マイ予約

これにより、初期ロード時間の短縮とバンドルサイズの最適化を実現しています。

## 更新履歴

- 2025-01-XX: 初版作成

