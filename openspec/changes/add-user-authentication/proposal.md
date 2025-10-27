# Add User Authentication - Proposal

## Why
利用者がログイン・登録できる認証機能を実装することで、予約機能やお気に入り店舗登録機能などの将来的な機能の前提条件となる認証基盤を構築する。

## What Changes
- メールアドレス・パスワードによる認証機能
- ユーザー登録・ログイン・ログアウト機能
- JWT によるセッション管理
- パスワードリセット機能（トークン生成のみ、メール送信は未実装）
- 認証状態の管理（Context API）
- 認証が必要なページの保護（ProtectedRoute）

## Impact
- **Affected specs**: 新規 capability `user-authentication` を追加
- **Affected code**:
  - `backend/database/migrations/006_add_users_table.sql` - users テーブル作成
  - `backend/src/routes/userAuth.ts` - 認証API実装
  - `backend/src/index.ts` - userAuth ルート追加
  - `frontend/src/contexts/AuthContext.tsx` - 認証状態管理
  - `frontend/src/components/auth/*.tsx` - 認証UI コンポーネント
  - `frontend/src/services/api.ts` - 認証API呼び出し
  - `frontend/src/App.tsx` - AuthProvider統合
  - `frontend/src/components/Layout.tsx` - ヘッダーに認証UI追加
- **Breaking changes**: なし（機能追加のみ）
