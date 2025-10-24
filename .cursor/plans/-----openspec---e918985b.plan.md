<!-- e918985b-acee-4171-8e21-d779cf77c2e7 92557eed-351a-4837-b43a-5231c798c367 -->
# Database Connection Pool Optimization Plan

## Current Performance Analysis

**Current Response Time**: 4.10秒（平均）- 5.81秒（最悪）

**Target**: 2秒以内（50%改善）

**Environment**: Railway Hobby Plan (Singapore region, 1GB RAM, dedicated vCPU)

## Current Connection Pool Configuration

`backend/src/config/database.ts`:

```typescript
max: 20                      // 最大接続数
idleTimeoutMillis: 30000     // 30秒でアイドル接続を閉じる
connectionTimeoutMillis: 2000 // 2秒で接続タイムアウト
```

## Identified Issues

### Issue 1: Connection Pool Size Too Large

- **Current**: max: 20
- **Problem**: Railway Hobby Planは限られたリソース（1GB RAM）
- **Impact**: 過剰な接続数がメモリを圧迫し、逆にパフォーマンスが低下

### Issue 2: Idle Timeout Too Long

- **Current**: 30秒
- **Problem**: 使用されていない接続が長時間保持される
- **Impact**: リソースの無駄遣い

### Issue 3: Connection Timeout Too Short

- **Current**: 2秒
- **Problem**: Railway（シンガポール）への接続に時間がかかる場合がある
- **Impact**: 接続タイムアウトエラーの可能性

### Issue 4: Missing Configuration

- **min**: 最小接続数が設定されていない
- **acquireTimeoutMillis**: クエリ実行時の接続取得タイムアウトが設定されていない
- **keepAlive**: TCP Keep-Aliveが設定されていない

## Optimization Strategy

### Phase 1: Optimize Pool Size (High Priority)

**Railway Hobby Planに最適化された設定**:

```typescript
const dbConfig: PoolConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // 接続プール設定（Railway Hobby Plan最適化）
  min: 2,                      // 最小接続数（常に2つ保持）
  max: 10,                     // 最大接続数（20 → 10に削減）
  idleTimeoutMillis: 10000,    // 10秒でアイドル接続を閉じる（30秒 → 10秒）
  connectionTimeoutMillis: 5000, // 5秒で接続タイムアウト（2秒 → 5秒）
  acquireTimeoutMillis: 5000,  // 5秒でクエリ実行タイムアウト（新規追加）
  
  // TCP Keep-Alive設定（新規追加）
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // 10秒後にKeep-Alive開始
} : {
  // ローカル環境の設定も同様に最適化
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'furanomi',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: false,
  
  min: 2,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  acquireTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};
```

### Phase 2: Add Connection Pool Monitoring (Medium Priority)

**追加する監視機能**:

```typescript
// 接続プール監視
export const getPoolStats = () => {
  return {
    total: pool.totalCount,      // 総接続数
    idle: pool.idleCount,        // アイドル接続数
    waiting: pool.waitingCount,  // 待機中のクライアント数
  };
};

// 定期的なログ出力（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = getPoolStats();
    console.log('📊 Pool Stats:', stats);
  }, 30000); // 30秒ごと
}
```

### Phase 3: Add Connection Pool Events (Low Priority)

**イベントハンドラーの追加**:

```typescript
// 接続作成時
pool.on('connect', (client) => {
  console.log('✅ New database connection established');
});

// 接続削除時
pool.on('remove', (client) => {
  console.log('🗑️ Database connection removed');
});

// エラー時
pool.on('error', (err, client) => {
  console.error('❌ Unexpected database error:', err);
});
```

## Expected Performance Impact

### After Phase 1 (Pool Size Optimization)

**Current Issues Addressed**:

1. メモリ使用量の削減（20接続 → 10接続）
2. アイドル接続の迅速なクリーンアップ（30秒 → 10秒）
3. 安定した最小接続数の維持（0 → 2）
4. TCP Keep-Aliveによる接続の安定化

**Expected Improvements**:

- **Response Time**: 4.10秒 → **2.5-3.0秒**（30-40%改善）
- **Consistency**: レスポンス時間の変動が減少
- **Reliability**: 接続タイムアウトエラーの減少

### After Phase 2 (Monitoring)

**Benefits**:

- 接続プールの状態を可視化
- パフォーマンスボトルネックの早期発見
- デバッグの効率化

### After Phase 3 (Event Handlers)

**Benefits**:

- 接続ライフサイクルの透明性向上
- エラーの早期検出と対応

## Implementation Steps

1. `backend/src/config/database.ts`の接続プール設定を最適化
2. 接続プール監視機能を追加
3. イベントハンドラーを追加
4. ローカル環境でテスト
5. Railway本番環境にデプロイ
6. パフォーマンステストを実行（複数回）
7. 接続プール統計を確認
8. 必要に応じて微調整

## Rationale for Settings

### min: 2

- 常に2つの接続を保持することで、初回リクエストの接続確立時間を削減
- Railway Hobby Planのリソースに適した最小値

### max: 10

- 20接続は1GB RAMには過剰
- 10接続で十分な並行処理が可能
- メモリ使用量を削減

### idleTimeoutMillis: 10000

- 10秒で十分（使用頻度が低い接続を迅速に解放）
- リソースの効率的な利用

### connectionTimeoutMillis: 5000

- Railway（シンガポール）への接続に十分な時間
- 2秒では短すぎる可能性

### acquireTimeoutMillis: 5000

- クエリ実行時の接続取得に十分な時間
- タイムアウトエラーを防ぐ

### keepAlive: true

- TCP接続を維持し、再接続のオーバーヘッドを削減
- Railway環境で特に有効

## Risk Assessment

**Low Risk**:

- 接続プール設定の変更は後方互換性がある
- 既存の機能に影響しない
- ロールバックが容易

**Testing Required**:

- ローカル環境で動作確認
- 本番環境で段階的にテスト
- 複数回のパフォーマンステスト

## Success Criteria

- [ ] レスポンス時間が2.5-3.0秒以内に安定
- [ ] 接続タイムアウトエラーが発生しない
- [ ] 接続プール統計が適切な値を示す
- [ ] メモリ使用量が削減される
- [ ] レスポンス時間の変動が減少する

### To-dos

- [ ] 現在のクエリとボトルネックを分析
- [ ] データベースインデックス追加用のマイグレーションファイル作成
- [ ] 簡易メモリキャッシュユーティリティ作成
- [ ] 店舗検索クエリの最適化（距離計算を1回に、不要フィールド削除）
- [ ] システム設定にキャッシュを適用
- [ ] ローカル環境でパフォーマンステスト
- [ ] 本番環境にマイグレーション適用
- [ ] 変更をデプロイ
- [ ] 本番環境でレスポンス時間を測定（目標: 2秒以内）
- [ ] バックログからTASK-012を削除