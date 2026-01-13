#!/usr/bin/env node

/**
 * 清除本地浏览器数据
 * 
 * 使用方法：
 *   node scripts/clear-data.js
 * 
 * 注意：
 *   此操作不可逆，请谨慎使用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据目录
const DATA_DIR = path.join(__dirname, '../data/camoufoxUserData');

console.log('==========================================');
console.log('WebAI2API - 数据清除脚本');
console.log('==========================================');
console.log('');

// 检查数据目录是否存在
if (!fs.existsSync(DATA_DIR)) {
    console.log('✅ 数据目录不存在，无需清除');
    process.exit(0);
}

console.log('⚠️  警告：此操作将删除所有浏览器数据！');
console.log('📁 数据目录:', DATA_DIR);
console.log('');
console.log('包含的内容：');

// 显示将要删除的文件
const files = getAllFiles(DATA_DIR);
if (files.length === 0) {
    console.log('  (空目录)');
} else {
    files.forEach(file => {
        const relativePath = path.relative(DATA_DIR, file);
        const stats = fs.statSync(file);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`  - ${relativePath} (${size} KB)`);
    });
}

console.log('');
console.log('⏳ 5 秒后自动取消，按 Ctrl+C 立即取消...');
console.log('');

// 等待 5 秒
setTimeout(() => {
    console.log('⏱️  倒计时结束，开始删除...');
    console.log('');

    try {
        // 删除数据目录
        fs.rmSync(DATA_DIR, { recursive: true, force: true });
        
        console.log('✅ 数据清除成功！');
        console.log('');
        console.log('下次启动时将使用新的浏览器实例。');
        console.log('如需恢复数据，请运行：npm run restore-data');

    } catch (error) {
        console.error('');
        console.error('❌ 清除失败:', error.message);
        process.exit(1);
    }
}, 5000);

/**
 * 递归获取所有文件
 */
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}
