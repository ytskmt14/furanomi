<!-- e918985b-acee-4171-8e21-d779cf77c2e7 85a50446-842c-4073-87f8-9f89dc799b9d -->
# バックエンドAPIレスポンス最適化（TASK-012）

## 📊 現状の問題

**ネットワークタイミング分析結果:**
- Waiting for server response: **4.85 秒** ← 最大のボトルネック
- Content Download: 850 ms
- Total: 約 **5.7 秒**

**問題の所在:**
1. データベースクエリが遅い（複数JOIN + 位置情報計算）
2. 全店舗に対してJavaScript側で営業時間判定を実行
3. 全店舗に対して距離計算を2回実行（SQL + JavaScript）
4. インデックスが不足している可能性

## 🎯 最適化戦略

### フェーズ1: データベース最適化（即効性大）

#### 1. インデックス追加

`backend/migrations/add_performance_indexes.sql`を作成:

```sql
-- 位置情報検索用のインデックス
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);

-- JOIN最適化用のインデックス
CREATE INDEX IF NOT EXISTS idx_shop_availability_shop_id ON shop_availability(shop_id);
CREATE INDEX IF NOT EXISTS idx_shops_shop_manager_id ON shops(shop_manager_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_active ON shops(is_active) WHERE is_active = true;

-- 複合インデックス（カテゴリフィルタ用）
CREATE INDEX IF NOT EXISTS idx_shops_category_active ON shops(category, is_active);
```

#### 2. クエリ最適化

**問題点:**
- 距離計算を2回実行（ORDER BY句とJavaScript側）
- 営業時間判定をJavaScript側で全店舗に実行

**改善案:**
- `SELECT`句に距離計算を含める（1回だけ計算）
- 不要なフィールドを削除（shop_manager情報は詳細時のみ必要）

`backend/src/routes/shops.ts` の最適化:

```typescript
// 最適化されたクエリ
let query = `
  SELECT 
    s.id, s.name, s.description, s.address, s.phone, s.email, 
    s.category, s.latitude, s.longitude, s.business_hours, 
    s.image_url, s.is_active,
    sa.status as availability_status, sa.updated_at as availability_updated_at
    ${lat && lng ? `, (
      6371000 * acos(
        cos(radians($${paramCount})) * cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians($${paramCount + 1})) + 
        sin(radians($${paramCount})) * sin(radians(s.latitude))
      )
    ) as distance` : ''}
  FROM shops s
  LEFT JOIN shop_availability sa ON s.id = sa.shop_id
  WHERE s.is_active = true
`;
```

### フェーズ2: キャッシュ戦略（即効性大）

#### 簡易メモリキャッシュ実装

`backend/src/utils/cache.ts`を作成:

```typescript
interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();
```

**キャッシュ戦略:**
- システム設定（search_radius）: 5分キャッシュ
- 店舗リスト（位置情報なし）: 30秒キャッシュ
- 空き状況はキャッシュしない（リアルタイム性維持）

### フェーズ3: レスポンスデータ最適化

#### 不要なフィールドの削除

- `created_at`, `updated_at`: 詳細画面でのみ必要
- `shop_manager`: 一覧では不要（詳細のみ）

### フェーズ4: ページネーション（将来対応）

初回ロード時は近くの店舗10-20件のみ返却し、スクロール時に追加ロード。

## 📁 実装ファイル

1. `backend/migrations/add_performance_indexes.sql` - 新規作成
2. `backend/src/utils/cache.ts` - 新規作成
3. `backend/src/routes/shops.ts` - 最適化
4. `openspec/backlog.md` - TASK-012追加

## ✅ 受け入れ基準

- [ ] データベースインデックスが追加されている
- [ ] 店舗検索APIのレスポンス時間が**2秒以内**
- [ ] メモリキャッシュが実装されている
- [ ] 距離計算が1回のみ実行されている
- [ ] 不要なフィールドが削除されている
- [ ] 本番環境で動作確認済み

## 📊 期待される改善効果

- **現在**: 4.85秒
- **目標**: **1.5秒以内**（70%削減）
- **理想**: **1秒以内**（80%削減）


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