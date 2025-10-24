<!-- e918985b-acee-4171-8e21-d779cf77c2e7 2d3d4858-40a8-4060-bd96-1ce989e2d8b2 -->
# Vercel SPA Static Files Configuration

## 現状の問題

`frontend/public/sitemap.xml`と`frontend/public/robots.txt`が存在するが、Vercel上でアクセスすると`index.html`の内容が返される。これはSPAのルーティング設定により、すべてのリクエストが`index.html`にフォールバックされているため。

## 解決方法

Web検索の結果、Vercelの公式推奨方法は**`vercel.json`に`rewrites`設定を追加**すること。ただし、Viteを使用している場合、`public/`ディレクトリのファイルは自動的にルートに配信されるべきだが、Vercelのデプロイ時にSPAルーティングが優先されている。

## 実装手順

### 1. `vercel.json`の修正（手動コピー方式）

プロジェクトルートの`vercel.json`を以下のように修正：

```json
{
  "buildCommand": "cd frontend && npm run build && cp public/sitemap.xml public/robots.txt dist/",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/sitemap.xml" },
    { "source": "/robots.txt", "destination": "/robots.txt" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**説明:**

- ビルドコマンドで`cp`コマンドを使用して静的ファイルを手動コピー
- `frontend/public/sitemap.xml`と`frontend/public/robots.txt`を`frontend/dist/`にコピー
- Viteの自動コピーに依存せず、明示的にファイルを配置
- `rewrites`設定で静的ファイルを優先的に配信
- 最も確実で、ビルドログでもコピー操作を確認可能

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