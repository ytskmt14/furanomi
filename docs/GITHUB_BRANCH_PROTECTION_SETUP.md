# GitHub Branch Protection設定ガイド

## 概要

mainブランチを保護し、直接のプッシュを防止し、プルリクエストによる変更のみを許可するための設定手順です。

## 設定手順

### 1. GitHubリポジトリにアクセス

1. https://github.com/ytskmt14/furanomi にアクセス
2. リポジトリの「Settings」タブに移動
3. 左サイドバーの「Branches」をクリック

### 2. Branch Protection Ruleを追加

#### Add rule ボタンをクリック

**Branch name pattern を設定:**
```
main
```

### 3. 保護ルールの設定

#### 必須設定

**1. Require a pull request before merging**
- ☑️ **必須**: プルリクエストが必須
- ☑️ **Require approvals**: 承認が必須
  - Number of required approvals: `1`
- ☑️ **Dismiss stale pull request approvals when new commits are pushed**
  - 新しいコミットをプッシュすると承認が無効になる

**2. Require status checks to pass before merging**
- ☑️ **必須**: ステータスチェックが成功している必要がある

#### 推奨設定

**3. Require conversation resolution before merging**
- ☑️ 会話が解決される必要がある（オプション）

**4. Require linear history**
- ☑️ リニアヒストリーを強制（マージコミット使用）
- または、`Allow squash merging` を許可

**5. Include administrators**
- ☑️ 管理者にも同じルールを適用

**6. Restrict who can push to matching branches**
- ☑️ **設定**: 許可されたユーザーのみがプッシュ可能
  - リポジトリオーナーのみアクセス可能に設定

### 4. 設定の保存

「Create」または「Save changes」ボタンをクリック

## 設定後の動作

### 許可される操作
- ローカルでmainブランチにコミット（⚠️ 直接pushは不可）
- feature ブランチの作成・コミット・push
- プルリクエストの作成・承認・マージ

### 制限される操作
- mainブランチへの直接push（`git push origin main`）
- マージ承認なしでのプルリクエストのマージ
- ステータスチェック失敗時のマージ

## トラブルシューティング

### ローカルのmainブランチにコミットしてしまった場合

```bash
# feature ブランチを作成してコミットを移動
git checkout -b feature/your-feature
git push origin feature/your-feature

# プルリクエストを作成してマージ
```

### 緊急修正が必要な場合

1. 別ブランチから緊急修正用ブランチを作成
2. プルリクエストを作成
3. 自己承認でマージ（管理者権限があれば）

### 保護ルールを一時的に解除する必要がある場合

**⚠️ 非推奨**: セキュリティリスクがあります

1. GitHubリポジトリの設定に移動
2. Branches → Branch protection rule
3. 「Edit」ボタンをクリック
4. 必要な設定を一時的に解除
5. 作業完了後、すぐに再設定

## 現在の推奨設定

```
☑️ Require a pull request before merging
   └─ ☑️ Require 1 approvals
   └─ ☑️ Dismiss stale pull request approvals

☑️ Require status checks to pass before merging

☑️ Do not allow bypassing the above settings
   └─ 管理者も含む

Restrict who can push to matching branches:
   └─ リポジトリオーナー（ytskmt14）のみ許可
```

## 注意事項

### ⚠️ 既存のコミット履歴

過去にmainブランチに直接pushした履歴は保持されますが、これ以降は保護ルールが適用されます。

### 🔒 セキュリティ

- フォークからの不要なプルリクエストは無視またはクローズ
- 秘密情報が含まれるコミットはGit履歴から削除する必要がある場合がある

## 参考リンク

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule)

