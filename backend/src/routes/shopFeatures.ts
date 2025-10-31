import express, { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireSystemAdmin } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// 店舗の機能設定取得
router.get('/:shopId/features', asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = req.params;

  // 店舗の存在確認
  const shopResult = await db.query('SELECT id FROM shops WHERE id = $1', [shopId]);
  if (shopResult.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  // 機能設定を取得
  const result = await db.query(
    'SELECT feature_name, enabled FROM shop_feature_settings WHERE shop_id = $1',
    [shopId]
  );

  // オブジェクト形式に変換
  const features: Record<string, boolean> = {};
  result.rows.forEach(row => {
    features[row.feature_name] = row.enabled;
  });

  res.json({ features });
}));

// 店舗の機能設定更新（システム管理者のみ）
router.put('/:shopId/features', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = req.params;
  const { featureName, enabled } = req.body;

  // バリデーション
  if (!featureName || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'featureName and enabled (boolean) are required' });
  }

  // 店舗の存在確認
  const shopResult = await db.query('SELECT id FROM shops WHERE id = $1', [shopId]);
  if (shopResult.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  // 機能設定を更新または作成
  await db.query(
    `INSERT INTO shop_feature_settings (shop_id, feature_name, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (shop_id, feature_name)
     DO UPDATE SET enabled = $3, updated_at = NOW()`,
    [shopId, featureName, enabled]
  );

  res.json({ message: 'Feature setting updated successfully' });
}));

// 複数機能の一括更新（システム管理者のみ）
router.put('/:shopId/features/bulk', authenticateToken, requireSystemAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = req.params;
  const { features } = req.body;

  // バリデーション
  if (!features || typeof features !== 'object') {
    return res.status(400).json({ error: 'features object is required' });
  }

  // 店舗の存在確認
  const shopResult = await db.query('SELECT id FROM shops WHERE id = $1', [shopId]);
  if (shopResult.rows.length === 0) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  // トランザクションで一括更新
  await db.query('BEGIN');
  try {
    for (const [featureName, enabled] of Object.entries(features)) {
      if (typeof enabled !== 'boolean') {
        throw new Error(`Invalid value for feature ${featureName}: must be boolean`);
      }
      await db.query(
        `INSERT INTO shop_feature_settings (shop_id, feature_name, enabled)
         VALUES ($1, $2, $3)
         ON CONFLICT (shop_id, feature_name)
         DO UPDATE SET enabled = $3, updated_at = NOW()`,
        [shopId, featureName, enabled]
      );
    }
    await db.query('COMMIT');
    res.json({ message: 'Feature settings updated successfully' });
  } catch (error: any) {
    await db.query('ROLLBACK');
    throw error;
  }
}));

// ヘルパー関数: 機能が有効かチェック
export async function isFeatureEnabled(shopId: string, featureName: string): Promise<boolean> {
  const result = await db.query(
    'SELECT enabled FROM shop_feature_settings WHERE shop_id = $1 AND feature_name = $2',
    [shopId, featureName]
  );

  if (result.rows.length === 0) {
    return false; // レコードが存在しない場合は無効とみなす
  }

  return result.rows[0].enabled;
}

export { router as shopFeatureRoutes };

