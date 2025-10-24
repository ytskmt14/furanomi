import { Pool, PoolConfig } from 'pg';

// データベース接続設定
const dbConfig: PoolConfig = process.env.DATABASE_URL ? {
  // Railwayの場合は接続文字列を使用
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // 接続プール設定（Railway Hobby Plan最適化）
  min: 2,                      // 最小接続数（常に2つ保持）
  max: 10,                     // 最大接続数（20 → 10に削減）
  idleTimeoutMillis: 10000,    // 10秒でアイドル接続を閉じる（30秒 → 10秒）
  connectionTimeoutMillis: 5000, // 5秒で接続タイムアウト（2秒 → 5秒）
  
  // TCP Keep-Alive設定（新規追加）
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // 10秒後にKeep-Alive開始
} : {
  // ローカル環境の場合は個別の環境変数を使用
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'furanomi',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: false,
  
  // ローカル環境の設定も同様に最適化
  min: 2,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// データベース接続プール
export const pool = new Pool(dbConfig);

// 接続プールイベントハンドラー
pool.on('connect', (client) => {
  console.log('✅ New database connection established');
});

pool.on('remove', (client) => {
  console.log('🗑️ Database connection removed');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected database error:', err);
});

// データベースクエリ用のヘルパー
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params)
};

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
