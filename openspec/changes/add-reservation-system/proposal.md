# Add Reservation System - Proposal

## Why
認証済み利用者が店舗を予約できる機能を追加することで、来店前の待ち時間をなくし、よりスムーズな飲食体験を提供する。また、店舗管理者が予約を管理できることで、来客数を最適化できる。

## What Changes
- 認証済みユーザーのみが予約可能な予約機能
- 予約者名は会員情報から自動取得
- 人数と何分後（15分/30分/1時間）の選択
- 予約確認・キャンセル機能
- 店舗管理者向け予約管理画面（承認・拒否機能）
- 予約ステータス管理（pending/approved/rejected/cancelled）

## Impact
- **Affected specs**: 新規 capability `reservation-system` を追加
- **Affected code**:
  - `backend/database/migrations/007_add_reservations_table.sql` - reservations テーブル作成
  - `backend/src/routes/reservations.ts` - 予約API実装
  - `backend/src/index.ts` - reservations ルート追加
  - `frontend/src/components/reservation/CreateReservationModal.tsx` - 予約作成UI
  - `frontend/src/components/reservation/MyReservations.tsx` - 自分の予約一覧
  - `frontend/src/services/api.ts` - 予約API呼び出し
- **Breaking changes**: なし（機能追加のみ）
