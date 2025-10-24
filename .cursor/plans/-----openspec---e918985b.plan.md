<!-- e918985b-acee-4171-8e21-d779cf77c2e7 bb04cadb-1a01-43ec-8136-20ab2ea40c98 -->
# TASK-001: アプリケーション全体のalert()をトースト通知に置き換え

## Overview

アプリケーション全体で使用されているブラウザネイティブの`alert()`を、よりモダンでユーザーフレンドリーなトースト通知に置き換えます。

## 調査結果: alert()使用箇所の全量

### 1. StaffAvailabilityUpdate.tsx（1箇所）

- **行83**: 空き状況更新成功
  ```typescript
  alert('空き状況を更新しました！');
  ```


### 2. ShopInfoEdit.tsx（2箇所）

- **行161**: 店舗情報保存成功
  ```typescript
  alert('店舗情報を保存しました！');
  ```

- **行164**: 店舗情報保存失敗
  ```typescript
  alert('保存に失敗しました。もう一度お試しください。');
  ```


### 3. AvailabilityUpdate.tsx（7箇所）

- **行118**: 空き状況更新成功
  ```typescript
  alert('空き状況を更新しました！');
  ```

- **行121**: 空き状況更新失敗
  ```typescript
  alert('更新に失敗しました。もう一度お試しください。');
  ```

- **行135**: QRコード再発行成功
  ```typescript
  alert('QRコードを再発行しました！');
  ```

- **行138**: QRコード再発行失敗
  ```typescript
  alert('再発行に失敗しました。もう一度お試しください。');
  ```

- **行152**: 合言葉再生成成功
  ```typescript
  alert('合言葉を再生成しました！');
  ```

- **行155**: 合言葉再生成失敗
  ```typescript
  alert('再生成に失敗しました。もう一度お試しください。');
  ```

- **行323**: URLコピー成功
  ```typescript
  alert('URLをコピーしました');
  ```


### 合計: 10箇所

## 課題

- ブラウザネイティブのalert()はUIがモダンでない
- ユーザー操作をブロックする
- モバイルでの表示が適切でない
- アクセシビリティに配慮されていない
- 成功/エラーの視覚的な区別がない

## 実装方針

shadcn/uiのToastコンポーネントを使用して、全てのalert()を置き換えます。

- ライブラリ: `@radix-ui/react-toast`（Radix UIのToastプリミティブ）
- スタイル: Tailwind CSS + shadcn/uiのデザインシステム
- 実装: カスタムフックで簡単に使用可能
- バリアント: 成功（緑）、エラー（赤）、情報（デフォルト）

## 実装手順

### Step 1: 依存関係のインストール

```bash
cd frontend
npm install @radix-ui/react-toast
```

### Step 2: Toastコンポーネントの作成

`frontend/src/components/ui/toast.tsx` を作成:

- Radix UIのToastプリミティブをラップ
- shadcn/uiのスタイルを適用
- 成功、エラー、情報など複数のバリアントをサポート

`frontend/src/components/ui/toaster.tsx` を作成:

- Toastのコンテナコンポーネント
- アプリケーション全体で使用

### Step 3: Toastフックの作成

`frontend/src/hooks/use-toast.ts` を作成:

- `toast()` 関数を提供
- 状態管理とToast表示のロジックを実装
- 使いやすいAPIを提供

### Step 4: App.tsxに統合

`frontend/src/App.tsx` にToasterコンポーネントを追加:

```tsx
import { Toaster } from './components/ui/toaster';

// アプリケーションのルート要素に追加
<Toaster />
```

### Step 5: 各コンポーネントの修正

#### 5-1. StaffAvailabilityUpdate.tsx（1箇所）

```typescript
// Before
alert('空き状況を更新しました！');

// After
toast({
  title: "更新完了",
  description: "空き状況を更新しました！",
});
```

#### 5-2. ShopInfoEdit.tsx（2箇所）

成功:

```typescript
// Before
alert('店舗情報を保存しました！');

// After
toast({
  title: "保存完了",
  description: "店舗情報を保存しました！",
});
```

失敗:

```typescript
// Before
alert('保存に失敗しました。もう一度お試しください。');

// After
toast({
  title: "保存失敗",
  description: "保存に失敗しました。もう一度お試しください。",
  variant: "destructive",
});
```

#### 5-3. AvailabilityUpdate.tsx（7箇所）

空き状況更新成功:

```typescript
toast({
  title: "更新完了",
  description: "空き状況を更新しました！",
});
```

空き状況更新失敗:

```typescript
toast({
  title: "更新失敗",
  description: "更新に失敗しました。もう一度お試しください。",
  variant: "destructive",
});
```

QRコード再発行成功:

```typescript
toast({
  title: "再発行完了",
  description: "QRコードを再発行しました！",
});
```

QRコード再発行失敗:

```typescript
toast({
  title: "再発行失敗",
  description: "再発行に失敗しました。もう一度お試しください。",
  variant: "destructive",
});
```

合言葉再生成成功:

```typescript
toast({
  title: "再生成完了",
  description: "合言葉を再生成しました！",
});
```

合言葉再生成失敗:

```typescript
toast({
  title: "再生成失敗",
  description: "再生成に失敗しました。もう一度お試しください。",
  variant: "destructive",
});
```

URLコピー成功:

```typescript
toast({
  description: "URLをコピーしました",
});
```

### Step 6: バックログの更新

`openspec/backlog.md` から TASK-001 を削除（完了タスクはバックログに残さない運用）

### Step 7: 動作確認

- フロントエンドのビルド確認
- 開発サーバーでの表示確認
- 各機能の動作確認:
    - スタッフ空き状況更新
    - 店舗情報編集
    - 店舗管理者の空き状況更新
    - QRコード再発行
    - 合言葉再生成
    - URLコピー

### Step 8: デプロイ

```bash
git add .
git commit -m "feat: TASK-001 全てのalert()をトースト通知に置き換え

- @radix-ui/react-toastを追加
- shadcn/ui Toastコンポーネントを実装
- useToastフックを作成
- 3コンポーネント10箇所のalert()をtoast()に置き換え
  - StaffAvailabilityUpdate.tsx (1箇所)
  - ShopInfoEdit.tsx (2箇所)
  - AvailabilityUpdate.tsx (7箇所)
- モバイル対応とアクセシビリティ改善
- 成功/エラーの視覚的な区別を追加"
git push origin main
```

## 実装詳細

### Toastコンポーネントの仕様

#### バリアント

- `default`: デフォルト（白背景）
- `destructive`: エラー（赤背景）

#### プロパティ

- `title`: タイトル（オプション）
- `description`: 説明文（オプション）
- `variant`: バリアント（デフォルト: "default"）
- `duration`: 表示時間（デフォルト: 5000ms）

#### 表示位置

- デスクトップ: 右上
- モバイル: 上部中央

### アクセシビリティ

- ARIA属性の適切な設定
- キーボード操作対応（Escキーで閉じる）
- スクリーンリーダー対応
- 自動フォーカス管理

## 受け入れ基準

- [ ] 全てのalert()が削除されている（10箇所）
- [ ] トースト通知コンポーネントが実装されている
- [ ] 成功時に適切なトースト通知が表示される
- [ ] エラー時に赤いトースト通知が表示される
- [ ] モバイルで適切に表示される
- [ ] アクセシビリティに配慮されている
- [ ] デスクトップとモバイルで表示位置が適切
- [ ] 複数のトーストが同時に表示可能
- [ ] ビルドエラーがない
- [ ] 全ての機能が正常に動作する

## 対象ファイル一覧

1. `frontend/src/components/staff/StaffAvailabilityUpdate.tsx` (1箇所)
2. `frontend/src/components/shopManager/ShopInfoEdit.tsx` (2箇所)
3. `frontend/src/components/shopManager/AvailabilityUpdate.tsx` (7箇所)

## 参考資料

- [Radix UI Toast Documentation](https://www.radix-ui.com/primitives/docs/components/toast)
- [shadcn/ui Toast Component](https://ui.shadcn.com/docs/components/toast)

### To-dos

- [ ] @radix-ui/react-toastをインストール
- [ ] frontend/src/components/ui/toast.tsxを作成
- [ ] frontend/src/components/ui/toaster.tsxを作成
- [ ] frontend/src/hooks/use-toast.tsを作成
- [ ] App.tsxにToasterコンポーネントを追加
- [ ] StaffAvailabilityUpdate.tsxのalert()を置き換え（1箇所）
- [ ] ShopInfoEdit.tsxのalert()を置き換え（2箇所）
- [ ] AvailabilityUpdate.tsxのalert()を置き換え（7箇所）
- [ ] フロントエンドのビルド確認
- [ ] 全機能の動作確認
- [ ] バックログからTASK-001を削除
- [ ] Gitコミット
- [ ] GitHubへプッシュしてデプロイ