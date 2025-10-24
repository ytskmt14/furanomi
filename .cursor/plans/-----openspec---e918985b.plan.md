<!-- e918985b-acee-4171-8e21-d779cf77c2e7 21d6566a-67fd-4167-81b7-5b620dd64d85 -->
# Vercel SPA Static Files Configuration

## 現状の問題

`frontend/public/sitemap.xml`と`frontend/public/robots.txt`が存在するが、Vercel上でアクセスすると`index.html`の内容が返される。これはSPAのルーティング設定により、すべてのリクエストが`index.html`にフォールバックされているため。

## 解決方法

Web検索の結果、Vercelの公式推奨方法は**`vercel.json`に`rewrites`設定を追加**すること。ただし、Viteを使用している場合、`public/`ディレクトリのファイルは自動的にルートに配信されるべきだが、Vercelのデプロイ時にSPAルーティングが優先されている。

## 実装手順

### 1. `vercel.json`の修正（Vercel公式推奨方法）

プロジェクトルートの`vercel.json`を以下のように修正：

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/sitemap.xml" },
    { "source": "/robots.txt", "destination": "/robots.txt" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**説明:**

- Vercel公式ドキュメントで推奨されている明示的な`rewrites`設定
- 静的ファイルを先に定義し、最後に`index.html`へのフォールバック
- 複雑な正規表現を使わず、シンプルで確実な方法
- 順序が重要：上から順に評価されるため、静的ファイルが優先される

### 2. ビルドとデプロイ

- フロントエンドをビルドして`sitemap.xml`と`robots.txt`が`frontend/dist/`に正しくコピーされることを確認
- Gitにコミットしてプッシュ
- Vercelの自動デプロイ完了を待つ

### 3. 動作確認

以下のURLにアクセスして正しく配信されることを確認：

- `https://furanomi.com/sitemap.xml` → XML形式で表示
- `https://furanomi.com/robots.txt` → テキスト形式で表示

## 技術的根拠

- Vercel公式ドキュメントとコミュニティのベストプラクティスに基づく
- `rewrites`の正規表現による除外パターンは、SPAルーティングと静的ファイル配信を両立させる標準的な方法
- Viteの`public/`ディレクトリはビルド時に`dist/`にコピーされるため、配置場所の変更は不要

### To-dos

- [ ] vercel.jsonを作成してrewrites設定を追加
- [ ] フロントエンドをビルドして静的ファイルの配置を確認
- [ ] 変更をGitにコミット
- [ ] GitHubにプッシュしてVercelデプロイ
- [ ] sitemap.xmlとrobots.txtの配信を確認