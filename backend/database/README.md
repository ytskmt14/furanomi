# ふらのみ データベース設計

## 概要

MVPリリース用の最小限のデータベース設計です。PostgreSQLを使用し、地理空間データ（PostGIS）に対応しています。

## テーブル構成

### 1. システム設定テーブル (`system_settings`)
- アプリケーション全体の設定を管理
- 検索半径、最大検索結果数などの設定

### 2. システム管理者テーブル (`system_admins`)
- システム管理者のアカウント情報
- 店舗の登録・削除権限を持つ

### 3. 店舗管理者テーブル (`shop_managers`)
- 店舗管理者のアカウント情報
- 店舗情報の更新・空き状況の更新権限を持つ

### 4. 店舗テーブル (`shops`)
- 店舗の基本情報
- 位置情報（緯度・経度）を含む
- 営業時間はJSONB形式で保存

### 5. 空き状況テーブル (`shop_availability`)
- 店舗の現在の空き状況
- リアルタイムで更新される

### 6. 店舗画像テーブル (`shop_images`)
- 店舗の画像情報（将来拡張用）

## セットアップ手順

### 1. PostgreSQL + PostGIS のインストール

```bash
# macOS (Homebrew)
brew install postgresql postgis

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib postgis

# Windows
# PostgreSQL公式サイトからインストーラーをダウンロード
```

### 2. データベース作成

```sql
-- PostgreSQLに接続
psql -U postgres

-- データベース作成
CREATE DATABASE furanomi;

-- PostGIS拡張機能を有効化
\c furanomi
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 3. 環境変数設定

```bash
# backend/.env ファイルを作成
cp .env.example .env

# データベース接続情報を設定
DB_HOST=localhost
DB_PORT=5432
DB_NAME=furanomi
DB_USER=postgres
DB_PASSWORD=your-password
```

### 4. データベース初期化

```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係インストール
npm install

# データベース初期化（スキーマ作成 + 初期データ投入）
npm run db:init
```

## スクリプト

- `npm run db:init` - データベース初期化
- `npm run db:reset` - データベースリセット
- `npm run db:migrate` - マイグレーション実行

## データベース設計の特徴

### 地理空間データ対応
- PostGIS拡張機能を使用
- 位置情報ベースの検索に対応
- 緯度・経度での距離計算が可能

### セキュリティ
- パスワードはbcryptでハッシュ化
- UUIDを使用したID管理
- 適切な外部キー制約

### 拡張性
- JSONB形式での柔軟なデータ保存
- 将来の機能拡張に対応した設計
- マイグレーション機能

## 初期データ

以下のテストデータが投入されます：

- **システム管理者**: admin / admin123
- **店舗管理者**: manager1, manager2, manager3 / manager123
- **店舗**: 5店舗（居酒屋2、カフェ2、レストラン1）
- **空き状況**: 各店舗の現在の空き状況

## 注意事項

- 本番環境では必ずパスワードを変更してください
- 環境変数は適切に管理してください
- 定期的なバックアップを実施してください
