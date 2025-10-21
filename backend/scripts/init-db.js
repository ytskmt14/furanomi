#!/usr/bin/env node

/**
 * データベース初期化スクリプト
 * スキーマ作成と初期データ投入を実行
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 環境変数設定
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'furanomi',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`✅ ${path.basename(filePath)} 実行完了`);
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} 実行エラー:`, error.message);
    throw error;
  }
}

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 データベース初期化開始...');
    
    // 1. スキーマ作成
    console.log('📋 スキーマ作成中...');
    await executeSQLFile(path.join(__dirname, '../database/schema.sql'));
    
    // 2. 初期データ投入
    console.log('🌱 初期データ投入中...');
    await executeSQLFile(path.join(__dirname, '../database/seed.sql'));
    
    console.log('✅ データベース初期化完了！');
    
  } catch (error) {
    console.error('❌ データベース初期化エラー:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// スクリプト実行
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
