# Requirements Document

## Introduction

UIコンポーネント仕様は、ふらのみアプリケーションで使用される共通UIコンポーネントの仕様を定義します。トースト通知システムを中心に、アプリケーション全体で一貫したユーザー体験を提供するためのコンポーネントを定義します。ブラウザネイティブのalert()を置き換え、モダンでアクセシブルな通知システムを提供します。

## Requirements

### Requirement 1: トースト通知システム
**Objective:** As a ユーザー, I want モダンなトースト通知システムで通知を受け取れる, so that ブラウザネイティブのalert()を置き換え、ユーザーフレンドリーな通知を表示できる

#### Acceptance Criteria
1. WHEN ユーザーが操作を実行する場合 THEN システム SHALL 適切なトースト通知を表示する
2. WHEN ユーザーが操作を実行する場合 THEN システム SHALL ユーザー操作をブロックしない
3. WHEN ユーザーが操作を実行する場合 THEN システム SHALL 自動的に消える（デフォルト5秒）
4. WHEN トースト通知が表示される場合 THEN システム SHALL 以下のバリアントを使用する：情報（青）- border-blue-200 bg-blue-50 text-blue-900（一般的な情報・通知）、成功（緑）- border-green-200 bg-green-50 text-green-900（操作成功・完了）、エラー（赤）- border-red-200 bg-red-50 text-red-900（エラー・失敗）
5. WHEN トースト通知が表示される場合 THEN システム SHALL デスクトップでは右上に表示する
6. WHEN トースト通知が表示される場合 THEN システム SHALL モバイルでは上部中央（ヘッダーと重ならないようtop-20で調整）に表示する
7. WHEN トースト通知が表示される場合 THEN システム SHALL 複数のトーストが同時に表示可能にする
8. WHEN トースト通知が表示される場合 THEN システム SHALL ARIA属性を適切に設定する
9. WHEN トースト通知が表示される場合 THEN システム SHALL キーボード操作に対応する（Escキーで閉じる）
10. WHEN トースト通知が表示される場合 THEN システム SHALL スクリーンリーダーに対応する
11. WHEN トースト通知が表示される場合 THEN システム SHALL 自動フォーカス管理を行う

### Requirement 2: トースト通知の実装仕様
**Objective:** As a 開発者, I want トースト通知システムを実装する, so that 以下の技術スタックで実装できる

#### Acceptance Criteria
1. WHEN トースト通知システムが実装される場合 THEN システム SHALL @radix-ui/react-toast（Radix UIのToastプリミティブ）ライブラリを使用する
2. WHEN トースト通知システムが実装される場合 THEN システム SHALL Tailwind CSS + shadcn/uiのデザインシステムを使用する
3. WHEN トースト通知システムが実装される場合 THEN システム SHALL カスタムフック（useToast）で簡単に使用可能にする
4. WHEN トースト通知システムが実装される場合 THEN システム SHALL 以下のコンポーネントを提供する：Toast（個別のトースト通知コンポーネント）、Toaster（トーストのコンテナコンポーネント）、useToast（トースト表示のためのカスタムフック）
5. WHEN アプリケーションが起動される場合 THEN システム SHALL Toasterコンポーネントをアプリケーションのルートに配置する
6. WHEN アプリケーションが起動される場合 THEN システム SHALL 全ての画面でトースト通知を利用可能にする

### Requirement 3: 既存alert()の置き換え
**Objective:** As a システム, I want アプリケーション全体のブラウザネイティブalert()をトースト通知に置き換える, so that モダンで一貫した通知体験を提供できる

#### Acceptance Criteria
1. WHEN alert()の置き換えが実行される場合 THEN システム SHALL StaffAvailabilityUpdate.tsx（1箇所）のalert()を置き換える
2. WHEN alert()の置き換えが実行される場合 THEN システム SHALL ShopInfoEdit.tsx（2箇所）のalert()を置き換える
3. WHEN alert()の置き換えが実行される場合 THEN システム SHALL AvailabilityUpdate.tsx（7箇所）のalert()を置き換える
4. WHEN 空き状況更新が成功する場合 THEN システム SHALL 緑色のトーストを表示する
5. WHEN 店舗情報保存が成功する場合 THEN システム SHALL 緑色のトーストを表示する
6. WHEN 店舗情報保存が失敗する場合 THEN システム SHALL 赤色のトーストを表示する
7. WHEN QRコード再発行が成功する場合 THEN システム SHALL 緑色のトーストを表示する
8. WHEN QRコード再発行が失敗する場合 THEN システム SHALL 赤色のトーストを表示する
9. WHEN 合言葉再生成が成功する場合 THEN システム SHALL 緑色のトーストを表示する
10. WHEN 合言葉再生成が失敗する場合 THEN システム SHALL 赤色のトーストを表示する
11. WHEN URLコピーが成功する場合 THEN システム SHALL 青色のトーストを表示する

