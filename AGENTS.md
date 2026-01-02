<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Project Rules

### 日時更新に関するルール

ドキュメント関連の日時（`spec.json`の`updated_at`、`created_at`など）を更新する際は、**必ずシステム日時を確認した上で更新すること**。

**手順**:
1. システム日時を取得: `date -u +"%Y-%m-%dT%H:%M:%S.000Z"` コマンドを実行
2. 取得した日時をISO 8601形式（UTC）で使用
3. 推測や仮の日時を使用しない

**適用範囲**:
- `.kiro/specs/*/spec.json` の `updated_at` フィールド
- その他、タイムスタンプが必要なドキュメント更新時

## Active Kiro Specifications

### shop-onboarding-flow
新規店舗登録から利用者アプリへの公開までのフロー整理とUI/UX改善

**Status**: Initialized  
**Next Step**: `/kiro/spec-requirements shop-onboarding-flow`