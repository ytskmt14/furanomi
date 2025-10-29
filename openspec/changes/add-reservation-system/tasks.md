# Reservation System Implementation Tasks

## 1. Database Schema
- [x] 1.1 Create migration file `007_add_reservations_table.sql`
- [x] 1.2 Run migration on local database
- [x] 1.3 Update schema.sql with reservations table

## 2. Backend API
- [x] 2.1 Create `backend/src/routes/reservations.ts`
- [x] 2.2 Implement `POST /api/reservations` endpoint (予約作成)
- [x] 2.3 Implement `GET /api/reservations/my` endpoint (自分の予約一覧)
- [x] 2.4 Implement `GET /api/reservations/:id` endpoint (予約詳細)
- [x] 2.5 Implement `DELETE /api/reservations/:id` endpoint (予約キャンセル)
- [x] 2.6 Implement `GET /api/reservations/shop/:shopId` endpoint (店舗の予約一覧)
- [x] 2.7 Implement `PUT /api/reservations/:id/approve` endpoint (予約承認)
- [x] 2.8 Implement `PUT /api/reservations/:id/reject` endpoint (予約拒否)
- [x] 2.9 Update `backend/src/index.ts` to register reservations routes

## 3. Frontend - Reservation Components
- [x] 3.1 Create `frontend/src/components/reservation/CreateReservationModal.tsx`
- [x] 3.2 Create `frontend/src/components/reservation/MyReservations.tsx`

## 4. Frontend - Integration
- [x] 4.1 Update `frontend/src/services/api.ts` with reservation methods
- [x] 4.2 Add "予約する"ボタンを ShopDetail に追加（未ログイン時は非表示）
- [x] 4.3 Add "マイ予約"ページを App.tsx に追加
- [x] 4.4 Add reservation notification icon to header with badge
- [x] 4.5 Add user menu dropdown (マイ予約、プロフィール、ログアウト)

## 5. Shop Manager - Reservation Management
- [x] 5.1 Create `frontend/src/components/shopManager/ReservationManagement.tsx`
- [x] 5.2 Add reservation management tab to ShopManagerApp
- [x] 5.3 Implement approve/reject functionality

## 6. Testing & Documentation
- [x] 6.1 Test reservation creation flow
- [x] 6.2 Test reservation cancellation flow
- [x] 6.3 Test shop manager approve/reject flow
- [x] 6.4 Test authenticated-only access
