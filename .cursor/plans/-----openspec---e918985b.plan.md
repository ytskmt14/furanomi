<!-- e918985b-acee-4171-8e21-d779cf77c2e7 db0f7232-db9f-4427-a29d-3f3923e604e6 -->
# 管理画面のSEO対策（TASK-007 & TASK-008）

## 概要

店舗管理者アプリとシステム管理者アプリの両方に、管理画面として適切なSEO設定を行います。主に`noindex`メタタグを設定して、検索エンジンにインデックスされないようにします。

## 対象ファイル

- `/shop-manager/*` - 店舗管理者アプリ
- `/system-admin/*` - システム管理者アプリ

## 実装方針

### 1. 店舗管理者アプリのSEO設定

`frontend/src/pages/shop-manager/`配下のルートコンポーネントまたはレイアウトコンポーネントで、`<Helmet>`または`useEffect`を使用してメタタグを設定します。

#### 設定するメタタグ

```html
<meta name="robots" content="noindex, nofollow" />
<meta name="googlebot" content="noindex, nofollow" />
<title>店舗管理 - ふらのみ</title>
```

### 2. システム管理者アプリのSEO設定

`frontend/src/pages/system-admin/`配下のルートコンポーネントまたはレイアウトコンポーネントで、同様にメタタグを設定します。

#### 設定するメタタグ

```html
<meta name="robots" content="noindex, nofollow" />
<meta name="googlebot" content="noindex, nofollow" />
<title>システム管理 - ふらのみ</title>
```

## 実装手順

### Step 1: 店舗管理者アプリのレイアウトコンポーネント確認

`frontend/src/components/shopManager/`または該当するレイアウトファイルを確認し、メタタグを追加する場所を特定します。

### Step 2: システム管理者アプリのレイアウトコンポーネント確認

`frontend/src/components/systemAdmin/`または該当するレイアウトファイルを確認し、メタタグを追加する場所を特定します。

### Step 3: 両方のアプリにnoindexメタタグを追加

React Helmetまたは`useEffect`を使用して、動的にメタタグを設定します。

### Step 4: 動作確認

- 店舗管理者アプリ（`/shop-manager/*`）でブラウザの開発者ツールを開き、`<head>`内に`noindex`メタタグが存在することを確認
- システム管理者アプリ（`/system-admin/*`）でも同様に確認

### Step 5: バックログの更新

- TASK-007とTASK-008を完了としてバックログから削除

### Step 6: コミットとデプロイ

- 変更をコミット
- GitHubにプッシュ
- Vercelの自動デプロイを確認

## 技術的な詳細

### 実装方法: useEffect（推奨）

管理画面はSEO対策やSSRが不要なため、シンプルな`useEffect`を使用します。

```typescript
useEffect(() => {
  const metaRobots = document.createElement('meta');
  metaRobots.name = 'robots';
  metaRobots.content = 'noindex, nofollow';
  document.head.appendChild(metaRobots);

  const metaGooglebot = document.createElement('meta');
  metaGooglebot.name = 'googlebot';
  metaGooglebot.content = 'noindex, nofollow';
  document.head.appendChild(metaGooglebot);

  document.title = '店舗管理 - ふらのみ';  // または 'システム管理 - ふらのみ'

  return () => {
    document.head.removeChild(metaRobots);
    document.head.removeChild(metaGooglebot);
  };
}, []);
```

**理由:**

- 管理画面は検索エンジンにインデックスされるべきではない
- SSR不要（認証後にしかアクセスできない）
- 追加の依存関係不要
- シンプルで保守しやすい

## 受け入れ基準

- [ ] 店舗管理者アプリに`noindex, nofollow`メタタグが設定されている
- [ ] システム管理者アプリに`noindex, nofollow`メタタグが設定されている
- [ ] 両方のアプリで適切なタイトルが設定されている
- [ ] ブラウザの開発者ツールで確認可能
- [ ] バックログからTASK-007とTASK-008が削除されている

### To-dos

- [ ] 店舗管理者アプリのレイアウトコンポーネントを確認
- [ ] システム管理者アプリのレイアウトコンポーネントを確認
- [ ] 店舗管理者アプリにnoindexメタタグを追加
- [ ] システム管理者アプリにnoindexメタタグを追加
- [ ] 店舗管理者アプリで動作確認
- [ ] システム管理者アプリで動作確認
- [ ] バックログからTASK-007とTASK-008を削除
- [ ] 変更をコミット・プッシュしてデプロイ