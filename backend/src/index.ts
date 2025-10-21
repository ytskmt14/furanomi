import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
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
    /^https:\/\/.*\.vercel\.app$/,
    'https://furanomi-frontend-134j7vnpc-ytskmt14s-projects.vercel.app'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
