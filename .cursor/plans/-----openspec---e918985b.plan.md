<!-- e918985b-acee-4171-8e21-d779cf77c2e7 8f60344e-f1c6-4007-b7ac-0e306f02f18b -->
# Backend API Performance Optimization Plan

## Current Performance

- Response time: 5.3 seconds
- Target: 1.5 seconds or less (70% reduction)
- Environment: Railway Trial Plan (Singapore region, 512MB RAM, 2 shared vCPU)

## Root Cause Analysis

### Critical Issue: Distance Calculation Executed 3 Times

In `backend/src/routes/shops.ts`, the Haversine formula (heavy trigonometric calculations) is executed 3 times per shop:

1. **SELECT clause (lines 47-53)**: Calculate distance for result
2. **WHERE clause (lines 106-112)**: Recalculate distance for filtering
3. **ORDER BY clause (lines 121-127)**: Recalculate distance for sorting

Each calculation includes: `cos()`, `sin()`, `acos()`, `radians()` - very CPU intensive.

### Additional Issues

- Parameters (lat, lng) are added 3 times to the array
- Database indexes not yet applied (migration file created but not executed on Railway)
- Shared CPU on Trial Plan amplifies the impact of redundant calculations

## Implementation Strategy

### Phase 1: Optimize Distance Calculation (High Priority)

**File**: `backend/src/routes/shops.ts`

Use PostgreSQL WITH clause (CTE) to calculate distance once and reference it:

```sql
WITH shop_distances AS (
  SELECT 
    s.id, s.name, s.description, s.address, s.phone, s.email, 
    s.category, s.latitude, s.longitude, s.business_hours, 
    s.image_url, s.is_active,
    sa.status as availability_status, 
    sa.updated_at as availability_updated_at,
    (
      6371000 * acos(
        cos(radians($1)) * cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(s.latitude))
      )
    ) as distance
  FROM shops s
  LEFT JOIN shop_availability sa ON s.id = sa.shop_id
  WHERE s.is_active = true
)
SELECT * FROM shop_distances
WHERE distance <= $3
ORDER BY 
  CASE WHEN availability_status = 'closed' THEN 1 ELSE 0 END ASC,
  distance ASC
```

This reduces distance calculation from **3 times to 1 time per shop**.

### Phase 2: Apply Database Indexes (High Priority)

**File**: `backend/migrations/add_performance_indexes.sql` (already created)

Execute the migration on Railway PostgreSQL to add:

- Location index: `shops(latitude, longitude)`
- JOIN optimization: `shop_availability(shop_id)`, `shops(shop_manager_id)`
- Filter index: `shops(is_active)`, `shops(category, is_active)`
- Settings index: `system_settings(key)`

### Phase 3: Optimize Parameter Handling

Remove duplicate lat/lng parameters - use only once in the WITH clause.

### Phase 4: Frontend Optimization (Low Priority)

**File**: `frontend/src/App.tsx`

Optional improvements:

- Reduce `enableHighAccuracy` timeout if needed
- Optimize default search radius (currently 10km)

## Expected Performance Impact

### After Phase 1 (Distance Calculation Optimization)

- **Current**: 5.3 seconds
- **Expected**: 2.0-2.5 seconds (60% improvement)
- **Savings**: 3.0-3.3 seconds

### After Phase 2 (Database Indexes)

- **Current**: 2.0-2.5 seconds
- **Expected**: 1.2-1.5 seconds (additional 40-50% improvement)
- **Savings**: 0.8-1.0 seconds

### Total Expected Result

- **Final Response Time**: 1.2-1.5 seconds
- **Total Improvement**: 70-75% faster

## Implementation Steps

1. Rewrite shop search query to use WITH clause for single distance calculation
2. Fix parameter handling to avoid duplication
3. Connect to Railway PostgreSQL and execute index migration
4. Test in local environment
5. Deploy to Railway
6. Measure production performance
7. Update backlog (mark TASK-012 as completed)

## Notes

- Railway region (Singapore) is optimal for Japan access - no need to change
- Trial Plan resources are limited but sufficient after query optimization
- The main bottleneck is algorithmic (3x redundant calculations), not infrastructure

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