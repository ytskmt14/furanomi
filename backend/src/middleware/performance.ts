/**
 * パフォーマンス監視ミドルウェア
 * Phase 1-4: Shops API Performance Optimization
 */

import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  method: string;
  url: string;
  responseTime: number;
  timestamp: string;
  cached?: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 100; // 最新100件のみ保持

  addMetric(metric: PerformanceMetrics): void {
    this.metrics.unshift(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return total / this.metrics.length;
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const cachedCount = this.metrics.filter(metric => metric.cached).length;
    return (cachedCount / this.metrics.length) * 100;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // レスポンス終了時にメトリクスを記録
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    performanceMonitor.addMetric({
      method: req.method,
      url: req.url,
      responseTime,
      timestamp: new Date().toISOString(),
      cached: res.getHeader('x-cached') === 'true'
    });

    // 開発環境では詳細ログを出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${req.method} ${req.url} - ${responseTime}ms`);
    }
  });

  next();
};

// パフォーマンス統計取得エンドポイント
export const getPerformanceStats = (req: Request, res: Response) => {
  const stats = {
    averageResponseTime: performanceMonitor.getAverageResponseTime(),
    cacheHitRate: performanceMonitor.getCacheHitRate(),
    totalRequests: performanceMonitor.getMetrics().length,
    recentMetrics: performanceMonitor.getMetrics().slice(0, 10)
  };

  res.json(stats);
};
