# Reservation System Implementation Tasks

## 1. Database Schema
- [ ] 1.1 Create migration file `007_add_reservations_table.sql`
- [ ] 1.2 Run migration on local database
- [ ] 1.3 Update schema.sql with reservations table

## 2. Backend API
- [ ] 2.1 Create `backend/src/routes/reservations.ts`
- [ ] 2.2 Implement `POST /api/reservations` endpoint (予約作成)
- [ ] 2.3 Implement `GET /api/reservations/my` endpoint (自分の予約一覧)
- [ ] 2.4 Implement `GET /api/reservations/:id` endpoint (予約詳細)
- [ ] 2.5 Implement `DELETE /api/reservations/:id` endpoint (予約キャンセル)
- [ ] 2.6 Implement `GET /api/reservations/shop/:shopId` endpoint (店舗の予約一覧)
- [ ] 2.7 Implement `PUT /api/reservations/:id/approve` endpoint (予約承認)
- [ ] 2.8 Implement `PUT /api/reservations/:id/reject` endpoint (予約拒否)
- [ ] 2.9 Update `backend/src/index.ts` to register reservations routes

## 3. Frontend - Reservation Components
- [ ] 3.1 Create `frontend/src/components/reservation/CreateReservationModal.tsx`
- [ ] 3.2 Create `frontend/src/components/reservation/MyReservations.tsx`
- [ ] 3.3 Create `frontend/src/components/reservation/ReservationDetail.tsx`

## 4. Frontend - Integration
- [ ] 4.1 Update `frontend/src/services/api.ts` with reservation methods
- [ ] 4.2 Add "予約する"ボタンを ShopDetail に追加
- [ ] 4.3 Add "マイ予約"ページを App.tsx に追加

## 5. Shop Manager - Reservation Management
- [ ] 5.1 Create `frontend/src/components/shopManager/ReservationManagement.tsx`
- [ ] 5.2 Add reservation management tab to ShopManagerApp
- [ ] 5.3 Implement approve/reject functionality

## 6. Testing & Documentation
- [ ] 6.1 Test reservation creation flow
- [ ] 6.2 Test reservation cancellation flow
- [ ] 6.3 Test shop manager approve/reject flow
- [ ] 6.4 Test authenticated-only access
- [ ] 6.5 Validate OpenSpec proposal
