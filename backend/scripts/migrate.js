#!/usr/bin/env node

/**
 * マイグレーション実行スクリプト
 * database/migrations/ 配下のSQLファイルを順番に実行
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
    return true;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} 実行エラー:`, error.message);
    // 既に実行済みのマイグレーションはスキップ（エラーを無視）
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`⚠️  ${path.basename(filePath)} は既に実行済みのためスキップ`);
      return true;
    }
    throw error;
  }
}

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 マイグレーション実行開始...');
    
    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    // マイグレーションファイルを取得してソート
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // ファイル名でソート（001, 002, ...の順）
    
    if (files.length === 0) {
      console.log('⚠️  マイグレーションファイルが見つかりません');
      return;
    }
    
    console.log(`📋 ${files.length}個のマイグレーションファイルを検出`);
    
    // 各マイグレーションファイルを順番に実行
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`\n📄 ${file} を実行中...`);
      await executeSQLFile(filePath);
    }
    
    console.log('\n✅ マイグレーション実行完了！');
    
  } catch (error) {
    console.error('❌ マイグレーション実行エラー:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// スクリプト実行
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };

