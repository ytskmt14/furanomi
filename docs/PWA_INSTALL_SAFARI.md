# SafariでPWAをインストールする方法

## iOS（iPhone/iPad）のSafari

### インストール手順

1. **Safariでサイトを開く**
   - iPhone/iPadのSafariアプリで `https://furanomi.com` にアクセス
   - 利用者アプリ（`https://furanomi.com/user`）にアクセス

2. **共有ボタンをタップ**
   - 画面下部の共有ボタン（□から矢印が出ているアイコン）をタップ
   - または、画面下部の中央にある「共有」ボタンをタップ

3. **「ホーム画面に追加」を選択**
   - 共有メニューが表示されたら、下にスクロール
   - 「ホーム画面に追加」をタップ
   - アイコンと名前を確認して「追加」をタップ

4. **ホーム画面から起動**
   - ホーム画面に「ふらのみ」アイコンが追加されます
   - タップすると、PWAとして起動します（ブラウザのUIが表示されません）

### 注意事項

- iOS Safariでは、サイトに一度アクセスしてから「ホーム画面に追加」が表示されます
- HTTPS環境（またはlocalhost）でのみPWAとして動作します
- iOS 16.4以降では、ホーム画面に追加したPWAでもプッシュ通知が利用可能です

---

## macOS（Mac）のSafari

### インストール手順

1. **Safariでサイトを開く**
   - MacのSafariで `https://furanomi.com` にアクセス
   - 利用者アプリ（`https://furanomi.com/user`）にアクセス

2. **メニューバーから「ファイル」→「ホーム画面に追加」を選択**
   - または、アドレスバーの共有ボタン（□から矢印が出ているアイコン）をクリック
   - 「ホーム画面に追加」を選択

3. **アプリ名を確認して「追加」をクリック**
   - アプリ名を確認して「追加」をクリック

4. **DockまたはLaunchpadから起動**
   - DockまたはLaunchpadに「ふらのみ」アイコンが追加されます
   - クリックすると、スタンドアロンウィンドウとしてPWAが起動します

### 注意事項

- macOS Safari 17以降（macOS Sonoma以降）でPWAサポートが強化されています
- スタンドアロンモードで起動し、専用ウィンドウとして動作します
- プッシュ通知は macOS Safari 16以降で利用可能です

---

## SafariでのPWA要件

### 必須要件

1. **HTTPS環境**
   - 本番環境ではHTTPSが必須です
   - ローカル開発では `localhost` でも動作します

2. **manifest.json**
   - サイトに `manifest.json` または `manifest.webmanifest` が存在すること
   - `display: "standalone"` が設定されていること

3. **Service Worker**
   - Service Workerが登録されていること
   - ただし、iOS SafariではService Workerのサポートが限定的です

4. **apple-touch-icon**
   - `index.html` に `<link rel="apple-touch-icon" href="/icon-128x128.svg">` が設定されていること

### 現在の実装状況

✅ **実装済み:**
- `manifest.json` が設定されている（vite-plugin-pwaで自動生成）
- `apple-touch-icon` が設定されている
- Service Workerが実装されている
- HTTPS環境で動作する

⚠️ **注意:**
- iOS Safariでは `beforeinstallprompt` イベントがサポートされていないため、現在の `PWAInstallPrompt` コンポーネントは表示されません
- ユーザーは手動で「ホーム画面に追加」を行う必要があります

---

## ユーザー向けの案内方法

### オプション1: ヘルプページに手順を追加

利用者アプリに「インストール方法」のヘルプページを追加することをおすすめします。

### オプション2: Safari用のインストール案内を表示

Safariでアクセスした場合に、インストール方法を案内するコンポーネントを追加できます。

以下は実装例です：

```typescript
// Safari検出とインストール案内コンポーネント
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isMacOS = /Macintosh/.test(navigator.userAgent);

if (isSafari && (isIOS || isMacOS)) {
  // Safari用のインストール案内を表示
}
```

### オプション3: 初回アクセス時のチュートリアル

初回アクセス時に、Safariユーザーに対してインストール手順を案内するモーダルを表示することもできます。

---

## トラブルシューティング

### 「ホーム画面に追加」が表示されない場合

1. **HTTPS環境か確認**
   - `https://furanomi.com` でアクセスしているか確認
   - ローカル開発では `localhost` でも動作します

2. **manifest.jsonが正しく配信されているか確認**
   - ブラウザの開発者ツール → Network タブで `manifest.json` または `manifest.webmanifest` が正常に読み込まれているか確認

3. **Service Workerが登録されているか確認**
   - 開発者ツール → Application → Service Workers で確認
   - iOS SafariではService Workerのサポートが限定的ですが、PWAとして動作します

4. **Safariのバージョンを確認**
   - iOS: iOS 11.3以降
   - macOS: macOS 10.13以降（Safari 11.1以降）

### インストール後、ブラウザのUIが表示される場合

- `manifest.json` の `display` が `"standalone"` に設定されているか確認
- ホーム画面から起動しているか確認（ブラウザから直接アクセスした場合は、ブラウザのUIが表示されます）

---

## 参考リンク

- [Apple Developer - Progressive Web Apps](https://developer.apple.com/safari/technologies/progressive-web-apps/)
- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)
- [Can I Use - Web App Manifest](https://caniuse.com/web-app-manifest)

