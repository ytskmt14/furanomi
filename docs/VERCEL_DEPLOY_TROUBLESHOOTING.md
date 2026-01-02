# Vercelデプロイエラーのトラブルシューティング

## 確認すべきポイント

### 1. Vercelダッシュボードでの確認

#### デプロイログの確認
1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Deployments」タブを開く
4. 失敗したデプロイをクリック
5. 「Build Logs」または「Function Logs」を確認

#### 確認すべきエラーメッセージ
- **ビルドエラー**: TypeScriptエラー、コンパイルエラー
- **依存関係エラー**: `npm install`の失敗
- **環境変数エラー**: 必要な環境変数が設定されていない
- **ファイルパスエラー**: ファイルが見つからない

### 2. ビルドコマンドの確認

現在の`vercel.json`の設定:
```json
{
  "buildCommand": "cd frontend && npm run build && cp public/sitemap.xml public/robots.txt dist/",
  "outputDirectory": "frontend/dist"
}
```

**問題点**: `cp`コマンドの構文が正しくない可能性があります。

**修正案**:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build && cp public/sitemap.xml dist/ && cp public/robots.txt dist/",
  "outputDirectory": "frontend/dist"
}
```

または、より安全な方法:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

（`public`ディレクトリのファイルは自動的に`dist`にコピーされるため、手動でコピーする必要はない可能性があります）

### 3. 環境変数の確認

Vercelダッシュボードで以下の環境変数が設定されているか確認:

**必須環境変数**:
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps APIキー
- `VITE_API_BASE_URL`: バックエンドAPIのURL（例: `https://api.furanomi.com/api`）

**確認方法**:
1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 各環境（Production, Preview, Development）で設定されているか確認

### 4. Node.jsバージョンの確認

Vercelが使用するNode.jsバージョンを確認:

**確認方法**:
1. Vercelダッシュボード → プロジェクト → Settings → General
2. 「Node.js Version」を確認
3. 必要に応じて`.nvmrc`ファイルを作成

**推奨**: `.nvmrc`ファイルを作成してNode.jsバージョンを固定
```bash
# frontend/.nvmrc
20
```

### 5. 依存関係の確認

`package.json`の依存関係が正しくインストールされるか確認:

**確認方法**:
- ローカルで`npm install`が成功するか
- `package-lock.json`が最新か
- `node_modules`が`.gitignore`に含まれているか

### 6. ビルド出力の確認

`frontend/dist`ディレクトリが正しく生成されるか確認:

**確認方法**:
```bash
cd frontend
npm run build
ls -la dist/
```

**確認すべきファイル**:
- `index.html`
- `assets/`ディレクトリ
- `sitemap.xml`（手動コピーする場合）
- `robots.txt`（手動コピーする場合）
- `OGP.png`（手動コピーする場合）

### 7. よくあるエラーと対処法

#### エラー: "Command failed: npm run build"
**原因**: TypeScriptエラー、コンパイルエラー
**対処**: ローカルで`npm run build`を実行してエラーを確認

#### エラー: "Module not found"
**原因**: 依存関係の不足、パスの問題
**対処**: `package.json`を確認し、`npm install`を実行

#### エラー: "Environment variable not found"
**原因**: 環境変数が設定されていない
**対処**: Vercelダッシュボードで環境変数を設定

#### エラー: "Build output directory not found"
**原因**: `outputDirectory`の設定が間違っている
**対処**: `vercel.json`の`outputDirectory`を確認

### 8. デバッグ手順

1. **ローカルでビルドを確認**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Vercel CLIでローカルビルドを確認**
   ```bash
   npm install -g vercel
   vercel build
   ```

3. **Vercelダッシュボードのログを確認**
   - エラーメッセージの全文を確認
   - スタックトレースを確認

4. **環境変数を確認**
   - Vercelダッシュボードで環境変数が正しく設定されているか確認

5. **ビルドコマンドを簡略化**
   - 一時的に`buildCommand`を`cd frontend && npm run build`のみにしてテスト

## 推奨される修正

### vercel.jsonの修正

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/sitemap.xml" },
    { "source": "/robots.txt", "destination": "/robots.txt" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**注意**: `public`ディレクトリのファイルはViteが自動的に`dist`にコピーするため、手動でコピーする必要はありません。

### 環境変数の設定

Vercelダッシュボードで以下を設定:
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_API_BASE_URL`

### Node.jsバージョンの固定

`frontend/.nvmrc`を作成:
```
20
```

## 次のステップ

1. Vercelダッシュボードのデプロイログを確認
2. エラーメッセージを特定
3. 上記の対処法を試す
4. 必要に応じて`vercel.json`を修正

