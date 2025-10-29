# Reservation System Specification

## Purpose
認証済み利用者が店舗を予約できる機能を提供し、予約の作成・管理・承認を行う。

## ADDED Requirements

### Requirement: Create Reservation
認証済みユーザーは店舗を予約できる。システムSHALL予約者名を会員情報から自動取得し、人数と何分後を入力できる。

#### Scenario: Successful Reservation
- **WHEN** 認証済みユーザーが店舗詳細で「予約する」をクリックする
- **THEN** 予約モーダルが表示される
- **AND** 予約者名が会員情報から自動入力される
- **AND** 人数選択（1〜10人）、何分後（15分/30分/1時間）を入力できる
- **AND** 予約作成後、pending ステータスで保存される

#### Scenario: Unauthenticated Access
- **WHEN** 未認証ユーザーが予約しようとする
- **THEN** ログインモーダルが表示される
- **AND** ログイン後、予約モーダルに戻る

#### Scenario: Reservation with User Info
- **WHEN** ユーザーが予約を作成する
- **THEN** ユーザーID、店舗ID、人数、何分後がデータベースに保存される
- **AND** 予約者名はusersテーブルから取得される

### Requirement: View My Reservations
認証済みユーザーは自分の予約一覧を確認できる。システムSHALL予約の詳細情報とステータスを表示する。

#### Scenario: View All Reservations
- **WHEN** 認証済みユーザーが「マイ予約」ページにアクセスする
- **THEN** 自分の予約一覧が表示される
- **AND** 各予約に店舗名、予約日時、人数、何分後、ステータスが表示される

#### Scenario: View Reservation Detail
- **WHEN** ユーザーが予約をクリックする
- **THEN** 予約詳細が表示される
- **AND** 店舗情報、予約者情報、ステータスが詳細に表示される

### Requirement: Cancel Reservation
認証済みユーザーは自分の予約をキャンセルできる。システムSHALL予約ステータスをcancelledに更新する。

#### Scenario: Successful Cancellation
- **WHEN** 認証済みユーザーが予約をキャンセルする
- **THEN** 予約ステータスが cancelled に更新される
- **AND** 予約一覧から削除される

#### Scenario: Cancel Others Reservation
- **WHEN** ユーザーが他人の予約をキャンセルしようとする
- **THEN** エラーメッセージが表示される
- **AND** 予約はキャンセルされない

### Requirement: Shop Manager View Reservations
店舗管理者は自分の店舗への予約一覧を確認できる。システムSHALL予約の詳細とステータスを表示する。

#### Scenario: View Shop Reservations
- **WHEN** 店舗管理者が予約管理画面にアクセスする
- **THEN** 自分の店舗への予約一覧が表示される
- **AND** 予約者名、人数、何分後、ステータスが表示される

#### Scenario: Filter by Status
- **WHEN** 店舗管理者が予約管理画面でフィルタを選択する
- **THEN** pending/approved/rejected/cancelled でフィルタリングできる

### Requirement: Approve Reservation
店舗管理者は予約を承認できる。システムSHALL予約ステータスをapprovedに更新する。

#### Scenario: Successful Approval
- **WHEN** 店舗管理者が予約を承認する
- **THEN** 予約ステータスが pending から approved に更新される
- **AND** 承認日時が記録される

#### Scenario: Auto-approve (Optional)
- **WHEN** 店舗が自動承認設定になっている
- **THEN** 予約作成時に自動的に approved になる

### Requirement: Reject Reservation
店舗管理者は予約を拒否できる。システムSHALL予約ステータスをrejectedに更新する。

#### Scenario: Successful Rejection
- **WHEN** 店舗管理者が予約を拒否する
- **THEN** 予約ステータスが pending から rejected に更新される
- **AND** 拒否理由が記録される（オプション）

### Requirement: Reservation Status Management
システムSHALL予約ステータスを適切に管理する。ステータスは pending, approved, rejected, cancelled のいずれかである。

#### Scenario: Status Flow
- **WHEN** 予約が作成される
- **THEN** ステータスは pending で保存される
- **AND** 店舗管理者が承認すると approved になる
- **AND** 店舗管理者が拒否すると rejected になる
- **AND** ユーザーがキャンセルすると cancelled になる

### Requirement: Header Reservation Access
システムSHALLヘッダーから予約情報に簡単にアクセスできるUIを提供する。認証済みユーザーは予約通知アイコンとユーザーメニューから予約一覧にアクセスできる。

#### Scenario: Reservation Notification Icon
- **WHEN** 認証済みユーザーがヘッダーを表示する
- **THEN** 予約通知アイコンが表示される
- **AND** pending予約がある場合、アイコンに赤いバッジで件数が表示される
- **AND** アイコンをクリックすると予約一覧ページに遷移する

#### Scenario: User Menu Dropdown
- **WHEN** 認証済みユーザーがユーザー名をクリックする
- **THEN** ドロップダウンメニューが表示される
- **AND** 「マイ予約」「プロフィール」「ログアウト」の3つの選択肢が表示される
- **AND** 「マイ予約」をクリックすると予約一覧ページに遷移する
- **AND** メニュー外をクリックするとメニューが閉じる
