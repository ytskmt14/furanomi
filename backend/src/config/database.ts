import { Pool, PoolConfig } from 'pg';

// データベース接続設定
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'furanomi',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // 最大接続数
  idleTimeoutMillis: 30000, // アイドルタイムアウト
  connectionTimeoutMillis: 2000, // 接続タイムアウト
};

// データベース接続プール
export const pool = new Pool(dbConfig);

// データベースクエリ用のヘルパー
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params)
};

// 接続テスト
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ データベース接続成功');
    return true;
  } catch (error) {
    console.error('❌ データベース接続エラー:', error);
    return false;
  }
};

// 接続プールの終了
export const closePool = async (): Promise<void> => {
  await pool.end();
};

// データベース初期化
export const initializeDatabase = async (): Promise<void> => {
  try {
    // 接続テスト
    await testConnection();
    
    // マイグレーション実行（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 データベース初期化中...');
      // マイグレーション実行ロジックは後で実装
    }
    
    console.log('✅ データベース初期化完了');
  } catch (error) {
    console.error('❌ データベース初期化エラー:', error);
    throw error;
  }
};
