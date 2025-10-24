import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { authRoutes } from './routes/auth';
import { shopRoutes } from './routes/shops';
import { availabilityRoutes } from './routes/availability';
import { systemRoutes } from './routes/system';
import staffRoutes from './routes/staff';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェアの設定
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://furanomi.com',
    'https://www.furanomi.com',
    /^https:\/\/.*\.vercel\.app$/,
    'https://furanomi-frontend-134j7vnpc-ytskmt14s-projects.vercel.app'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger UI設定（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Furanomi API Documentation',
      customfavIcon: '/favicon.ico'
    }));
    console.log('📚 Swagger UI available at http://localhost:' + PORT + '/api-docs');
  } catch (error) {
    console.warn('⚠️  Swagger documentation not available:', error);
  }
} else {
  console.log('ℹ️  Swagger UI is disabled in production (NODE_ENV=' + process.env.NODE_ENV + ')');
}

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API ルート
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/staff', staffRoutes);

// エラーハンドリング
app.use(errorHandler);

// 404 ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🏪 Shop API: http://localhost:${PORT}/api/shops`);
  console.log(`📈 Availability API: http://localhost:${PORT}/api/availability`);
  console.log(`⚙️  System API: http://localhost:${PORT}/api/system`);
  console.log(`👥 Staff API: http://localhost:${PORT}/api/staff`);
});

export default app;
