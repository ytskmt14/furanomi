# Add PWA Support - Proposal

## Why
オフライン環境でも店舗情報を確認でき、空き状況の変更をプッシュ通知で受け取れるPWAとしての機能を追加することで、ユーザー体験を向上させる。

## What Changes
- Web App Manifest (`manifest.json`) を追加
- Service Workerを実装してキャッシュ戦略を設定
- オフライン機能（店舗一覧・詳細表示）
- プッシュ通知機能（空き状況変更通知）
- 利用者向け・店舗管理者向けのホーム画面追加対応

## Impact
- **Affected specs**: 新規 capability `pwa` を追加
- **Affected code**:
  - `frontend/public/manifest.json` - Web App Manifest
  - `frontend/public/sw.js` - Service Worker
  - `frontend/src/main.tsx` - Service Worker登録
  - `frontend/public/` - アイコンファイル追加
- **Breaking changes**: なし（機能追加のみ）

