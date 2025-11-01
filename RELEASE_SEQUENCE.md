# Phase2 リリース実行順序

## 重要: mainブランチマージで自動デプロイが開始されます

---

## 実行順序

### ✅ ステップ1: デプロイ前準備（完了）

- [x] コード品質確認・修正
- [x] バージョン更新（1.1.0）
- [x] CHANGELOG.md作成
- [x] ビルド確認
- [x] Gitコミット・タグ作成

### ⏳ ステップ2: データベースマイグレーション（次に実行）

**RailwayのPostgreSQLに接続して実行**

詳しい手順は `docs/RELEASE_CHECKLIST.md` を参照

### ⏳ ステップ3: 環境変数確認

**Railway・Vercelで環境変数を確認**

詳しい手順は `docs/RELEASE_CHECKLIST.md` を参照

### ⏳ ステップ4: phase-2ブランチをリモートにプッシュ

```bash
git push origin phase-2
git push origin v1.1.0
```

### ⏳ ステップ5: mainブランチにマージ（デプロイ開始）

```bash
git checkout main
git merge phase-2
git push origin main
git push origin v1.1.0
```

### ⏳ ステップ6: デプロイ後の検証

機能の動作確認（`docs/RELEASE_CHECKLIST.md`のステップ4参照）

### ⏳ ステップ7: GitHub Release作成

GitHub Releasesページで作成

---

## 現在の状態

- **現在のブランチ**: phase-2
- **コミット済み**: v1.1.0リリースコミット
- **タグ作成済み**: v1.1.0
- **次のステップ**: データベースマイグレーション
