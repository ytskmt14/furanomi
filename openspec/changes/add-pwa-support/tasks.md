# Add PWA Support - Tasks

## 1. OpenSpecの作成
- [ ] 1.1 proposal.md作成
- [ ] 1.2 tasks.md作成
- [ ] 1.3 spec deltas作成（pwa/spec.md）
- [ ] 1.4 validation実行

## 2. Web App Manifest実装
- [x] 2.1 manifest.json作成
- [ ] 2.2 アイコンファイル確認・追加（不足がある場合）
- [ ] 2.3 アイコンの各種サイズ設定
- [ ] 2.4 テーマカラー設定

## 3. Service Worker実装
- [x] 3.1 Service Worker作成（キャッシュ戦略）
- [x] 3.2 キャッシュ対象リソース定義
  - 静的ファイル（HTML、CSS、JS）
  - 店舗データのキャッシュ
- [x] 3.3 オフライン対応（Network First戦略）
- [x] 3.4 Service Worker登録（main.tsx）

## 4. プッシュ通知実装
- [x] 4.1 通知許可UI追加（Service Workerに実装済み）
- [ ] 4.2 バックエンドに通知エンドポイント追加
- [ ] 4.3 空き状況変更時の通知送信ロジック
- [ ] 4.4 通知の管理画面

## 5. テスト・デプロイ
- [ ] 5.1 オフライン動作確認
- [ ] 5.2 プッシュ通知動作確認（バックエンド実装後に）
- [x] 5.3 ホーム画面追加確認（iOS・Android）- manifest.json設定完了
- [x] 5.4 デプロイ

