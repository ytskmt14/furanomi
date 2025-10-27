# Project Context

## Purpose
「ふらのみ」は、利用者が現在地から近いお店の空き状況をリストや地図上で確認できるWebアプリケーションです。店舗管理者がリアルタイムで空き状況を更新し、利用者が簡単にお店を見つけられるサービスを提供します。

## Tech Stack
- **フロントエンド**: React + TypeScript（PWA対応）
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: PostgreSQL
- **地図機能**: Google Maps API
- **認証**: JWT
- **デプロイ**: フロントエンド（Vercel/Netlify）、バックエンド（Railway/Render）

## Project Conventions

### Code Style
- TypeScriptを必須使用
- ESLint + Prettierでコードフォーマット統一
- 関数名はcamelCase、コンポーネント名はPascalCase
- 日本語コメント可、変数名は英語

### Architecture Patterns
- フロントエンド: React Hooks + Context API（状態管理）
- バックエンド: RESTful API設計
- データベース: 正規化されたリレーショナル設計
- 認証: JWT + HTTP-only cookies

### Testing Strategy
- フロントエンド: Jest + React Testing Library
- バックエンド: Jest + Supertest
- E2E: Playwright（将来実装）

### Git Workflow
- mainブランチからfeatureブランチを作成
- コミットメッセージ: `feat:`, `fix:`, `docs:`, `refactor:` プレフィックス使用
- 機能単位でコミット（フロント実装完了時、バックエンド実装完了時など）
- ローカル開発のため、PRは任意

### Phase別リリースブランチ運用

#### ブランチ構成
```
main (本番環境)
├── phase-2 (Phase 2統合ブランチ)
│   ├── feature/add-user-authentication
│   ├── feature/add-reservation-system
│   └── feature/add-notification-preferences
├── phase-3 (Phase 3統合ブランチ)
│   └── feature/... (各機能ブランチ)
└── phase-4 (Phase 4統合ブランチ)
    └── feature/... (各機能ブランチ)
```

#### 運用ルール

**1. Phaseブランチの作成**
- Phaseごとに統合ブランチを作成（`phase-2`, `phase-3`, ...）
- mainブランチから作成
- Phaseで実装する全機能の統合先

**2. 機能ブランチの作成**
- Phaseブランチから機能ごとにfeatureブランチを作成
- 命名規則: `feature/add-{機能名}` または `feature/update-{機能名}`
- 例: `feature/add-user-authentication`, `feature/update-schema`

**3. 実装フロー**
1. 機能ブランチで実装
2. 完了後にPhaseブランチにマージ
3. Phase内の全機能完了後に統合テスト
4. 確認後にmainにマージしてリリース

**4. Phaseブランチの管理**
- Phaseブランチはmainにはマージしない（個別機能単位でマージ）
- Phaseブランチが古くなった場合は削除し、新しいPhaseブランチを再作成
- 各機能ブランチは完了後、mainに直接マージしてリリース

## Domain Context
- **利用者**: お店の空き状況を確認したい一般ユーザー
- **店舗管理者**: 自分の店舗の情報と空き状況を管理する人
- **システム管理者**: 全体の店舗情報とユーザーを管理する人
- **店舗**: レストラン、カフェ、居酒屋などの飲食店

## Important Constraints
- スモールスタート方針：段階的に機能を追加
- PWA対応でネイティブアプリライクな体験を提供
- リアルタイム性：空き状況は即座に反映
- プライバシー：位置情報は最小限の使用

## External Dependencies
- **Google Maps API**: 地図表示と位置情報サービス
- **位置情報API**: ブラウザのGeolocation API
- **PWA**: Service Worker、Web App Manifest

## Development Workflow

### 開発体制
- ペアプログラミング形式（ユーザー + AI）
- Git管理によるバージョン管理
- OpenSpecによるspec駆動開発

### 基本的な機能開発プロセス
1. **フロントエンド実装**: UIコンポーネント作成（モックデータ使用）
2. **画面確認**: ブラウザで動作・デザイン確認
3. **バックエンド実装**: API・DB実装
4. **統合**: フロントエンドとバックエンドの繋ぎ込み（実データ使用）
5. **最終確認**: 統合後の動作確認

### 開発サイクル
1. **仕様策定**: OpenSpec提案の作成・レビュー
2. **実装**: 上記プロセス1→2→3→4→5の順で実装
3. **検証**: 各段階でローカルテスト・動作確認
4. **コミット**: 機能単位でGitコミット
5. **次フェーズ**: 完了後、次の機能へ

### モックデータ戦略
- フロントエンド開発時は`src/mocks/`にモックデータを配置
- API呼び出しは環境変数で切り替え（モック/実API）
- バックエンド完成後、実APIに切り替え

### OpenSpecフロー
- `openspec/changes/` で提案作成（初回のみ）
- レビュー・承認後に実装開始
- 実装完了後は手動で `openspec archive` を実行
- `openspec/specs/` に確定仕様を保存

### レビュー・承認
- 口頭での確認（「承認します」「画面確認OK」など）
- 提案内容の確認: `openspec show [change-id]`
- 検証: `openspec validate [change-id] --strict`

### 実装方針
- スモールスタートを重視
- フロントエンドファースト開発
- 段階的な機能追加
- シンプルな実装を優先
- 必要に応じて複雑化
