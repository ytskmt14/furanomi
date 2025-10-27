# User Authentication Specification

## Purpose
利用者がログイン・登録できる認証機能を提供し、JWT によるセッション管理を実現する。

## ADDED Requirements

### Requirement: User Registration
利用者はメールアドレス・パスワードでアカウントを登録できる。システムSHALL既存のメールアドレスとの重複をチェックし、パスワードをハッシュ化して保存する。

#### Scenario: Successful Registration
- **WHEN** 利用者がメールアドレス、パスワード、名前を入力して登録する
- **THEN** メールアドレスがユニークかチェックされる
- **AND** パスワードがハッシュ化されて保存される
- **AND** ユーザーIDが生成され、ログイン状態になる
- **AND** JWT トークンが発行される

#### Scenario: Duplicate Email
- **WHEN** 利用者が既に登録済みのメールアドレスで登録しようとする
- **THEN** エラーメッセージ「このメールアドレスは既に登録されています」が表示される

#### Scenario: Weak Password
- **WHEN** 利用者が弱いパスワード（6文字未満）で登録しようとする
- **THEN** エラーメッセージ「パスワードは6文字以上で入力してください」が表示される

### Requirement: User Login
利用者はメールアドレス・パスワードでログインできる。システムSHALL認証情報を検証し、JWT トークンを発行する。

#### Scenario: Successful Login
- **WHEN** 利用者が有効なメールアドレスとパスワードを入力してログインする
- **THEN** 認証情報が検証される
- **AND** JWT トークンが発行される
- **AND** ユーザー情報が返される
- **AND** 最終ログイン時刻が更新される

#### Scenario: Invalid Credentials
- **WHEN** 利用者が無効なメールアドレスまたはパスワードでログインしようとする
- **THEN** エラーメッセージ「メールアドレスまたはパスワードが正しくありません」が表示される

#### Scenario: Non-existent Account
- **WHEN** 利用者が未登録のメールアドレスでログインしようとする
- **THEN** エラーメッセージ「メールアドレスまたはパスワードが正しくありません」が表示される

### Requirement: User Logout
利用者はログアウトできる。システムSHALL JWT トークンを無効化し、認証状態をクリアする。

#### Scenario: Successful Logout
- **WHEN** 利用者がログアウトする
- **THEN** JWT トークンがクッキーから削除される
- **AND** 認証状態がクリアされる
- **AND** 利用者アプリトップ（/user）にリダイレクトされる

### Requirement: Password Reset Request
利用者はパスワードリセットを要求できる。システムSHALLリセットトークンを生成してデータベースに保存する。

#### Scenario: Password Reset Request
- **WHEN** 利用者が登録済みのメールアドレスを入力してパスワードリセットを要求する
- **THEN** リセットトークンが生成される
- **AND** トークンがデータベースに保存される
- **AND** トークンの有効期限が24時間に設定される
- **AND** 成功メッセージが表示される（メール送信は未実装）

#### Scenario: Non-existent Email
- **WHEN** 利用者が未登録のメールアドレスでパスワードリセットを要求する
- **THEN** セキュリティ上の理由で、存在しないメールアドレスでも成功メッセージが表示される

### Requirement: Password Reset Confirmation
利用者はリセットトークンを使用してパスワードをリセットできる。システムSHALLトークンの有効性を検証し、新しいパスワードを設定する。

#### Scenario: Successful Password Reset
- **WHEN** 利用者が有効なリセットトークンと新しいパスワードを入力する
- **THEN** トークンの有効性がチェックされる
- **AND** 新しいパスワードがハッシュ化されて保存される
- **AND** リセットトークンが無効化される
- **AND** ログインページにリダイレクトされる

#### Scenario: Invalid Token
- **WHEN** 利用者が無効または有効期限切れのリセットトークンを使用する
- **THEN** エラーメッセージ「無効または有効期限切れのトークンです」が表示される

### Requirement: Current User Information
利用者は現在のログイン情報を取得できる。システムSHALL認証されたユーザーの情報を返す。

#### Scenario: Get Current User
- **WHEN** 利用者がログイン状態で現在のユーザー情報を取得する
- **THEN** ユーザーID、メールアドレス、名前が返される
- **AND** 電話番号が設定されている場合は電話番号も返される

#### Scenario: Unauthenticated Access
- **WHEN** 利用者が認証されていない状態で現在のユーザー情報を取得しようとする
- **THEN** 401エラーが返される
- **AND** エラーメッセージ「認証が必要です」が表示される

### Requirement: Protected Routes
認証が必要なページは保護される。システムSHALL未認証のユーザーをリダイレクトする。

#### Scenario: Authenticated Access
- **WHEN** 利用者がログイン状態で保護されたページにアクセスする
- **THEN** 通常通りページが表示される

#### Scenario: Unauthenticated Access
- **WHEN** 利用者が未認証状態で保護されたページにアクセスしようとする
- **THEN** ログインページにリダイレクトされる
- **AND** 元のページURLが保存される（リダイレクト後に戻れる）
