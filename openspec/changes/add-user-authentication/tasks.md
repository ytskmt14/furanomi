# User Authentication Implementation Tasks

## 1. Database Schema
- [ ] 1.1 Create migration file `006_add_users_table.sql`
- [ ] 1.2 Run migration on local database
- [ ] 1.3 Update schema.sql with users table

## 2. Backend API
- [ ] 2.1 Create `backend/src/routes/userAuth.ts`
- [ ] 2.2 Implement `/api/user-auth/register` endpoint
- [ ] 2.3 Implement `/api/user-auth/login` endpoint
- [ ] 2.4 Implement `/api/user-auth/logout` endpoint
- [ ] 2.5 Implement `/api/user-auth/me` endpoint
- [ ] 2.6 Implement `/api/user-auth/password-reset/request` endpoint
- [ ] 2.7 Implement `/api/user-auth/password-reset/confirm` endpoint
- [ ] 2.8 Update `backend/src/index.ts` to register userAuth routes

## 3. Frontend - Authentication Context
- [ ] 3.1 Create `frontend/src/contexts/AuthContext.tsx`
- [ ] 3.2 Implement AuthProvider component
- [ ] 3.3 Implement `login()`, `logout()`, `register()` functions

## 4. Frontend - UI Components
- [ ] 4.1 Create `frontend/src/components/auth/LoginModal.tsx`
- [ ] 4.2 Create `frontend/src/components/auth/RegisterModal.tsx`
- [ ] 4.3 Create `frontend/src/components/auth/PasswordResetModal.tsx`
- [ ] 4.4 Create `frontend/src/components/auth/UserProfile.tsx`
- [ ] 4.5 Create `frontend/src/components/auth/ProtectedRoute.tsx`

## 5. Frontend - Integration
- [ ] 5.1 Update `frontend/src/services/api.ts` with auth methods
- [ ] 5.2 Wrap App with AuthProvider in `frontend/src/App.tsx`
- [ ] 5.3 Add `/user/profile` route in `frontend/src/App.tsx`
- [ ] 5.4 Update `frontend/src/components/Layout.tsx` with auth UI

## 6. Testing & Documentation
- [ ] 6.1 Test registration flow
- [ ] 6.2 Test login flow
- [ ] 6.3 Test logout flow
- [ ] 6.4 Test password reset flow
- [ ] 6.5 Test protected routes
- [ ] 6.6 Validate OpenSpec proposal
