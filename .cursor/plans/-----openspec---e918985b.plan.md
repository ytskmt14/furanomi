<!-- e918985b-acee-4171-8e21-d779cf77c2e7 4b79a7b0-5b26-496a-9eda-dbca308525df -->
# Vercel SPA Static Files Configuration

## 現状の問題
`frontend/public/sitemap.xml`と`frontend/public/robots.txt`が存在するが、Vercel上でアクセスすると`index.html`の内容が返される。これはSPAのルーティング設定により、すべてのリクエストが`index.html`にフォールバックされているため。

## 解決方法
Web検索の結果、Vercelの公式推奨方法は**`vercel.json`に`rewrites`設定を追加**すること。ただし、Viteを使用している場合、`public/`ディレクトリのファイルは自動的にルートに配信されるべきだが、Vercelのデプロイ時にSPAルーティングが優先されている。

## 実装手順

### 1. `vercel.json`の作成
プロジェクトルートに`vercel.json`を作成し、以下の設定を追加：

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/((?!sitemap\\.xml|robots\\.txt).*)",
      "destination": "/index.html"
    }
  ]
}
```

**説明:**
- `source`の正規表現で`sitemap.xml`と`robots.txt`を除外
- それ以外のすべてのパスは`/index.html`にリライト
- これにより、静的ファイルは直接配信され、SPAルーティングも維持される

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