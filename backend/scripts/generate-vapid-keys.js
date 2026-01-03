#!/usr/bin/env node

/**
 * VAPIDキー生成スクリプト
 * 
 * 使用方法:
 *   node scripts/generate-vapid-keys.js
 * 
 * または:
 *   npm run generate-vapid-keys
 */

const webpush = require('web-push');

console.log('\n=======================================');
console.log('VAPIDキーを生成しています...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);
console.log('\n=======================================');
console.log('\n以下の内容を backend/.env ファイルに追加してください:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n⚠️  注意: VAPID_PRIVATE_KEYは絶対に公開しないでください！\n');

