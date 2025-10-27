# Add Landing Page - Proposal

## Why
利用者に対してふらのみサービスの価値提案を明確に伝え、サービス利用を促進するためのランディングページが必要。

現在、アプリに直接アクセスしても「ふらのみとは何か」「どのように使うのか」「どのような機能があるのか」が分かりにくい。

## What Changes
- `/lp` ルートにランディングページを追加
- サービス概要、主な機能、利用方法、参加店舗の展示
- 利用者向けアプリへの導線を提供
- レスポンシブ対応、パフォーマンス最適化
- SEO対策を実施

## Impact
- **Affected specs**: 新規 capability `landing-page` を追加
- **Affected code**: 
  - `frontend/src/App.tsx` - ルート追加
  - `frontend/src/components/landing/` - 新規コンポーネント
  - `frontend/public/` - SEO関連ファイル（sitemap.xml, robots.txt更新）
- **Breaking changes**: なし（新規追加のみ）

