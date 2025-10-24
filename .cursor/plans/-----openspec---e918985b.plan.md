<!-- e918985b-acee-4171-8e21-d779cf77c2e7 5be822a5-dc25-4eda-971f-e3450ff63508 -->
# Shops API Further Performance Optimization Plan

## Current Performance Analysis

**Current Response Time**: 226ms (server processing) + 119ms (data transfer) = 345ms total

**Target**: 150ms (server processing) + 60ms (data transfer) = **210ms or less**

**Improvement Goal**: 40% reduction

## Current Status

**Already Optimized**:

- Distance calculation: 3 times → 1 time (WITH clause)
- Database indexes: Applied
- Business hours logic: Moved to SQL
- Connection pool: Optimized (10 connections, keepAlive enabled)

## Phase 1: Response Data Optimization (Low Difficulty - Immediate Effect)

### 1.1 Remove Unnecessary Fields

**Current Response**:

```typescript
{
  id, name, description, address, phone, email, 
  category, latitude, longitude, business_hours, 
  image_url, is_active, availability_status, 
  availability_updated_at, distance
}
```

**Optimized Response** (remove unused fields):

```typescript
{
  id, name, description, address, category,
  image_url, availability_status, distance,
  business_hours // Keep but consider simplification
}
```

**Fields to Remove**:

- `phone` - Not displayed in list view
- `email` - Not displayed in list view
- `latitude` - Only used for distance calculation (already done)
- `longitude` - Only used for distance calculation
- `is_active` - Already filtered in WHERE clause
- `availability_updated_at` - Not displayed in list view

**Expected Effect**: Response size -30%, Transfer time 119ms → **80ms**

### 1.2 Simplify Business Hours Data

**Current**: Full JSONB object with all days

**Optimized**: Only return current day + next day (for close_next_day logic)

**Expected Effect**: Response size -20%, Transfer time 80ms → **60ms**

### 1.3 Enable Gzip Compression

**Check if already enabled in Express**:

```typescript
import compression from 'compression';
app.use(compression());
```

**Expected Effect**: If not enabled, response size -70%

## Phase 2: Query Result Caching (Medium Difficulty - High Effect)

### 2.1 Implement Location-Based Cache

**Cache Strategy**:

```typescript
// Round coordinates to reduce cache keys
const cacheKey = `shops_${Math.round(lat * 100) / 100}_${Math.round(lng * 100) / 100}_${radius}`;

// Cache shop basic info (excluding availability)
const cachedShops = cache.get<Shop[]>(cacheKey);

if (cachedShops) {
  // Merge with real-time availability data
  const availability = await getRealtimeAvailability(cachedShops.map(s => s.id));
  return mergeShopsWithAvailability(cachedShops, availability);
}
```

**Cache Configuration**:

- **Shop basic info**: 5 minutes (infrequently changed)
- **Availability status**: No cache (real-time)
- **System settings**: Already cached (5 minutes)

**Expected Effect**:

- First request: 226ms (no change)
- Subsequent requests: **50-80ms** (70% reduction)

### 2.2 Implement Redis for Distributed Cache (Optional)

**Only if multiple Railway instances**:

- Use Redis for shared cache across instances
- Railway Hobby Plan supports Redis add-on

**Expected Effect**: Consistent cache across all instances

## Phase 3: PostgreSQL Configuration Optimization (Medium Difficulty - Medium Effect)

### 3.1 Optimize Railway PostgreSQL Settings

**Check Current Settings**:

```sql
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW work_mem;
```

**Recommended Settings for Railway Hobby Plan (1GB RAM)**:

```sql
-- Railway may have these optimized already
-- Check and request Railway support if needed
```

**Expected Effect**: Query execution -10-15%, 226ms → **190-200ms**

### 3.2 Add Query-Specific Indexes (If Missing)

**Check existing indexes**:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('shops', 'shop_availability');
```

**Add composite index if not exists**:

```sql
-- For distance + status filtering
CREATE INDEX IF NOT EXISTS idx_shops_location_active 
ON shops(latitude, longitude, is_active) 
WHERE is_active = true;
```

**Expected Effect**: Query execution -5-10%

## Phase 4: Query Parallelization (High Difficulty - High Effect)

### 4.1 Split Query into Parallel Execution

**Current**: Single query with all JOINs

**Optimized**: Parallel queries + merge in application

```typescript
const [shopsData, availabilityData] = await Promise.all([
  db.query(shopsQuery),      // Shop basic info
  db.query(availabilityQuery) // Availability status
]);

// Merge results in Node.js
const mergedShops = mergeShopsWithAvailability(shopsData, availabilityData);
```

**Expected Effect**: -20-30% if I/O bound, 226ms → **160-180ms**

**Risk**: Increased complexity, two database round trips

## Phase 5: Advanced Optimization (Optional - Future)

### 5.1 Materialized View

**Create pre-computed view**:

```sql
CREATE MATERIALIZED VIEW shop_search_view AS
SELECT s.*, sa.status, sa.updated_at as availability_updated_at
FROM shops s
LEFT JOIN shop_availability sa ON s.id = sa.shop_id
WHERE s.is_active = true;

-- Refresh every 5 minutes
CREATE OR REPLACE FUNCTION refresh_shop_search_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY shop_search_view;
END;
$$ LANGUAGE plpgsql;
```

**Expected Effect**: -50% or more

**Trade-off**: 5-minute delay for shop updates

### 5.2 PostGIS Extension for Geo Queries

**Install PostGIS** (if Railway supports):

```sql
CREATE EXTENSION postgis;

-- Use PostGIS geography type
ALTER TABLE shops ADD COLUMN location GEOGRAPHY(POINT, 4326);
UPDATE shops SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- Spatial index
CREATE INDEX idx_shops_location_gist ON shops USING GIST(location);
```

**Expected Effect**: Distance calculation -60-70%

## Implementation Roadmap

### Week 1: Quick Wins

1. Phase 1.1: Remove unnecessary fields
2. Phase 1.2: Simplify business hours
3. Phase 1.3: Enable Gzip compression
4. **Goal**: 226ms → **180ms**

### Week 2: Caching

1. Phase 2.1: Location-based cache
2. Test cache effectiveness
3. **Goal**: 180ms → **50-80ms** (cached)

### Week 3: Database Optimization

1. Phase 3.1: PostgreSQL settings review
2. Phase 3.2: Additional indexes
3. **Goal**: 180ms → **160ms** (uncached)

### Week 4: Advanced (Optional)

1. Phase 4.1: Query parallelization
2. Evaluate Phase 5 options
3. **Goal**: 160ms → **120-140ms**

## Expected Final Results

| Metric | Current | After Phase 1 | After Phase 2 | After Phase 3 | Target |

|--------|---------|---------------|---------------|---------------|--------|

| Server Processing | 226ms | 180ms | 50-80ms (cached) | 160ms (uncached) | 150ms |

| Data Transfer | 119ms | 60ms | 60ms | 60ms | 60ms |

| **Total** | **345ms** | **240ms** | **110-140ms** | **220ms** | **210ms** |

**First Request**: 220ms (36% improvement)

**Cached Request**: 110-140ms (60-68% improvement)

## Risk Assessment

**Low Risk**:

- Phase 1: Response field removal (ensure frontend compatibility)
- Phase 2: Caching (ensure cache invalidation works)

**Medium Risk**:

- Phase 3: Database settings (test thoroughly)
- Phase 4: Query parallelization (increased complexity)

**High Risk**:

- Phase 5: Materialized views (data freshness trade-off)
- Phase 5: PostGIS (requires Railway support)

## Success Criteria

- [ ] Phase 1: Server processing time < 180ms
- [ ] Phase 2: Cached response time < 140ms
- [ ] Phase 3: Uncached response time < 160ms
- [ ] No functionality regression
- [ ] Cache hit rate > 70%
- [ ] Real-time availability maintained

## Monitoring

**Metrics to Track**:

1. Average response time (uncached)
2. Average response time (cached)
3. Cache hit rate
4. Database query execution time
5. Memory usage
6. Error rate

**Tools**:

- Chrome DevTools Network tab
- Railway metrics dashboard
- Custom logging in Express middleware

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