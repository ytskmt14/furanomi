# 複数パスのPWA化実装ドキュメント

## 概要

このドキュメントでは、異なるパス（利用者、店舗管理、スタッフ、システム管理）をそれぞれ独立したPWAとしてインストールできるようにした実装について説明します。

## アーキテクチャ

### Scopeベースの複数manifest方式

各役割（ユーザータイプ）ごとに専用の`manifest.json`ファイルを用意し、`scope`パラメータで適用範囲を分離することで、同じデバイスに複数のPWAをインストール可能にしています。

## 実装内容

### 1. 複数のmanifest.jsonファイル

`public/`ディレクトリに以下のmanifestファイルを配置：

- **`manifest-user.json`** - 利用者用PWA
  - `scope: "/user"`
  - `start_url: "/user"`
  - `theme_color: "#3B82F6"` (青)

- **`manifest-shop-manager.json`** - 店舗管理用PWA
  - `scope: "/shop-manager"`
  - `start_url: "/shop-manager"`
  - `theme_color: "#10B981"` (緑)

- **`manifest-staff.json`** - スタッフ用PWA
  - `scope: "/staff"`
  - `start_url: "/staff/availability"`
  - `theme_color: "#F59E0B"` (オレンジ)

- **`manifest-system-admin.json`** - システム管理用PWA
  - `scope: "/system-admin"`
  - `start_url: "/system-admin"`
  - `theme_color: "#EF4444"` (赤)

### 2. 動的manifestリンク（index.html）

`index.html`で現在のURLパスに応じて適切なmanifestを動的に読み込みます：

```javascript
// 現在のパスに応じて適切なmanifestを選択
const path = window.location.pathname;
let manifestPath = '/manifest.json'; // デフォルト

if (path.startsWith('/shop-manager')) {
  manifestPath = '/manifest-shop-manager.json';
} else if (path.startsWith('/staff')) {
  manifestPath = '/manifest-staff.json';
// ... etc
```

### 3. パスタイプ別のlocalStorage管理（PWAInstallPrompt.tsx）

各パスタイプごとに独立したlocalStorageキーを使用：

```typescript
// パスタイプを取得
const getPathType = (path: string): string => {
  if (path.startsWith('/shop-manager')) return 'shop-manager';
  if (path.startsWith('/staff')) return 'staff';
  if (path.startsWith('/system-admin')) return 'system-admin';
  if (path.startsWith('/user')) return 'user';
  return 'user';
};

// パスタイプ固有のlocalStorageキー
const storageKey = `pwa-install-path-${pathType}`;
```

保存されるデータ構造：
```typescript
{
  path: "/shop-manager",
  pathType: "shop-manager",
  timestamp: 1704335400000,
  confirmed: true
}
```

### 4. PWA起動時のリダイレクト処理（App.tsx）

PWA起動時に、インストールされた際のパスに自動的にリダイレクト：

```typescript
// 各パスタイプのインストール情報をチェック
const pathTypes = ['shop-manager', 'staff', 'system-admin', 'user'];
for (const pathType of pathTypes) {
  const storageKey = `pwa-install-path-${pathType}`;
  const installPathData = localStorage.getItem(storageKey);
  // ... リダイレクト処理
}
```

## 動作フロー

### インストール時

1. ユーザーが特定のパス（例：`/shop-manager`）でインストールボタンをクリック
2. `getPathType()`で現在のパスタイプを判定
3. `pwa-install-path-shop-manager`というキーでlocalStorageに保存
4. 該当するmanifest（`manifest-shop-manager.json`）が読み込まれる
5. PWAがインストールされる

### 起動時

1. PWAアイコンをタップ（通常は`/`で起動）
2. App.tsxで`isStandalone`と`isPWALaunch`を確認
3. localStorageから該当するパスタイプのインストール情報を取得
4. 保存されていたパス（例：`/shop-manager`）にリダイレクト
5. 適切なmanifestが読み込まれ、正しいscopeで動作

## 利点

1. **複数PWAインストール可能**
   - 同じデバイスに複数の役割のPWAを別々のアプリとしてインストール可能
   - 例：利用者用と店舗管理用の両方をインストール

2. **独立した設定**
   - 各PWAは独立した名前、アイコン、テーマカラーを持つ
   - 通知設定なども個別に管理可能

3. **明確な役割分離**
   - ユーザーは自分の役割に応じたPWAをインストール
   - ホーム画面で視覚的に区別しやすい

4. **後方互換性**
   - 共通の`pwa-install-path`キーもフォールバックとして保持
   - 既存のインストールにも対応

## 注意事項

### Scopeの制約

- 各PWAは設定された`scope`内でのみ動作
- scope外のパスに移動した場合、ブラウザで開かれる可能性がある
- 現在の実装では各パスが独立しているため問題なし

### キャッシュの管理

- Service Workerは共通のため、キャッシュは全PWAで共有される
- 必要に応じてscopeごとにService Workerを分離することも検討可能

### iOS Safariの制限

- iOSでは「ホーム画面に追加」が手動のため、ユーザーに手順を案内
- 暫定的なパス保存により、直接ホーム画面に追加した場合にも対応

## テスト方法

### 1. ローカル環境でのテスト

```bash
# ビルド
npm run build

# プレビュー
npm run preview
```

### 2. 各パスでのインストール確認

- `/user` - 利用者用PWAとしてインストール
- `/shop-manager` - 店舗管理用PWAとしてインストール
- `/staff/availability` - スタッフ用PWAとしてインストール
- `/system-admin` - システム管理用PWAとしてインストール

### 3. 起動後の確認

- 各PWAアイコンから起動
- 正しいパスにリダイレクトされるか確認
- ブラウザのDevToolsでlocalStorageを確認

## トラブルシューティング

### リダイレクトが動作しない

- ブラウザの開発者ツールでlocalStorageの内容を確認
- `pwa-install-path-{pathType}`キーが存在するか確認
- `confirmed: true`になっているか確認

### 複数のPWAがインストールできない

- 各manifestの`scope`が重複していないか確認
- ブラウザのキャッシュをクリアして再度試す

### iOS Safariで正しく動作しない

- `index.html`のmanifest選択ロジックを確認
- Safariの「ホーム画面に追加」機能の制限に注意

## 今後の拡張案

1. **Service Workerのscope分離**
   - 各PWAで独立したService Workerを使用
   - キャッシュ戦略を個別に最適化

2. **アイコンのカスタマイズ**
   - 各役割ごとに異なるアイコンを使用
   - 視覚的な区別をさらに明確に

3. **通知の個別管理**
   - 各PWAで独立した通知許可を取得
   - 役割に応じた通知内容のカスタマイズ

4. **サブドメイン方式への移行**
   - さらに完全な分離が必要な場合、サブドメイン方式を検討
   - 例：`user.furanomi.app`, `shop.furanomi.app`
