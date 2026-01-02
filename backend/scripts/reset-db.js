#!/usr/bin/env node

/**
 * データベースリセットスクリプト
 * 全テーブルを削除してから初期化を実行
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

async function dropAllTables() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  既存テーブルを削除中...');
    
    // 外部キー制約を無視して全テーブルを削除
    const dropTablesSQL = `
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `;
    
    await client.query(dropTablesSQL);
    console.log('✅ 全テーブル削除完了');
    
  } catch (error) {
    console.error('❌ テーブル削除エラー:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function resetDatabase() {
  try {
    console.log('🔄 データベースリセット開始...');
    
    // 1. 全テーブルを削除
    await dropAllTables();
    
    // 2. スキーマ作成
    console.log('📋 スキーマ作成中...');
    await executeSQLFile(path.join(__dirname, '../database/schema.sql'));
    
    // 3. 初期データ投入
    console.log('🌱 初期データ投入中...');
    await executeSQLFile(path.join(__dirname, '../database/seed.sql'));
    
    console.log('✅ データベースリセット完了！');
    
  } catch (error) {
    console.error('❌ データベースリセットエラー:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// スクリプト実行
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };

