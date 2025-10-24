<!-- e918985b-acee-4171-8e21-d779cf77c2e7 e09ecb49-6a3b-4786-aa65-9ed6c6ac5383 -->
# TASK-006: 利用者アプリのSEO対策

## 実装方針（推奨案を採用）

1. TDK設定: index.htmlに静的に設定（シンプル、利用者アプリは1ページなので十分）
2. OGP画像: 今回はスキップ（後で追加）
3. 構造化データ: 基本的なWebサイト情報のみ
4. sitemap.xml: 手動で作成（静的なURL構成のため）

## 実装内容

### 1. TDK設定（index.html）

`frontend/index.html` を更新:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- TDK設定 -->
    <title>ふらのみ - 近くの店舗の空き状況を確認</title>
    <meta name="description" content="居酒屋・カフェ・レストランの空き状況をリアルタイムで確認。混雑状況を見てからお店を選べます。" />
    <meta name="keywords" content="居酒屋,カフェ,レストラン,空き状況,混雑,リアルタイム,ふらのみ" />
    
    <!-- OGP設定（基本） -->
    <meta property="og:title" content="ふらのみ - 近くの店舗の空き状況を確認" />
    <meta property="og:description" content="居酒屋・カフェ・レストランの空き状況をリアルタイムで確認。混雑状況を見てからお店を選べます。" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://furanomi.com" />
    <meta property="og:site_name" content="ふらのみ" />
    <meta property="og:locale" content="ja_JP" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="ふらのみ - 近くの店舗の空き状況を確認" />
    <meta name="twitter:description" content="居酒屋・カフェ・レストランの空き状況をリアルタイムで確認。" />
    
    <!-- その他のメタタグ -->
    <meta name="author" content="ふらのみ" />
    <meta name="theme-color" content="#ffffff" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**変更点:**

- `lang="en"` → `lang="ja"`（日本語サイト）
- `<title>frontend</title>` → 適切なタイトルに変更
- TDK設定を追加
- OGP設定を追加（画像は後で追加）
- Twitter Card設定を追加

### 2. 構造化データ（JSON-LD）

`frontend/index.html` の `<head>` 内に追加:

```html
<!-- 構造化データ（JSON-LD） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ふらのみ",
  "url": "https://furanomi.com",
  "description": "福岡の居酒屋・カフェ・レストランの空き状況をリアルタイムで確認できるサービス",
  "inLanguage": "ja",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://furanomi.com?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### 3. sitemap.xml

`frontend/public/sitemap.xml` を作成:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://furanomi.com/</loc>
    <lastmod>2025-01-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**注意:**

- 店舗管理者アプリとシステム管理者アプリは意図的に含めない（noindex設定のため）
- 利用者アプリは基本的に1ページ構成のため、ルートのみ

### 4. robots.txt

`frontend/public/robots.txt` を作成:

```
User-agent: *
Allow: /

# 管理画面はクロール禁止
Disallow: /shop-manager
Disallow: /system-admin

Sitemap: https://furanomi.com/sitemap.xml
```

### 5. バックログ更新

`openspec/backlog.md` から TASK-006 を削除（完了タスクは削除する運用）

## 受け入れ基準

- [ ] index.htmlに適切なTDK設定がされている
- [ ] 構造化データ（JSON-LD）が追加されている
- [ ] sitemap.xmlが作成されている
- [ ] robots.txtが作成されている
- [ ] 管理画面がクロール対象外になっている
- [ ] ビルドエラーがない
- [ ] 本番環境で正しく動作する
- [ ] Google Search Consoleで検証可能な状態

## デプロイ後の確認事項

1. 本番環境（https://furanomi.com）でソースコードを確認
2. Google Search Console でサイトマップを登録
3. Google の構造化データテストツールで検証
4. Lighthouse SEOスコアを確認（目標: 90以上）

## 今後の改善（TASK-006完了後）

- OGP画像の作成と設定
- ファビコンの変更（現在は vite.svg）
- より詳細な構造化データ（LocalBusiness）の追加
- パフォーマンス最適化（Core Web Vitals）

### To-dos

- [ ] index.htmlのlangをjaに変更
- [ ] TDK設定を追加（title, description, keywords）
- [ ] OGP設定を追加
- [ ] Twitter Card設定を追加
- [ ] 構造化データ（JSON-LD）を追加
- [ ] sitemap.xmlを作成
- [ ] robots.txtを作成
- [ ] フロントエンドのビルド確認
- [ ] バックログからTASK-006を削除
- [ ] 変更をコミット
- [ ] GitHubへプッシュしてデプロイ
- [ ] 本番環境で動作確認