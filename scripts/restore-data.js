#!/usr/bin/env node

/**
 * 从 Hugging Face Dataset 恢复浏览器数据
 * 
 * 使用方法：
 *   node scripts/restore-data.js
 * 
 * 环境变量：
 *   HF_DATASET_REPO: Dataset 仓库（如：iudd/webai2api-data）
 *   HF_TOKEN: Hugging Face Token（需要 read 权限）
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据目录
const DATA_DIR = path.join(__dirname, '../data/camoufoxUserData');
const TEMP_DIR = '/tmp/webai2api-data-restore';

// 环境变量
const HF_DATASET_REPO = process.env.HF_DATASET_REPO;
const HF_TOKEN = process.env.HF_TOKEN;

console.log('==========================================');
console.log('WebAI2API - 数据恢复脚本');
console.log('==========================================');

// 检查环境变量
if (!HF_DATASET_REPO) {
    console.error('❌ 错误：未设置 HF_DATASET_REPO 环境变量');
    console.error('请在 Space Settings 中添加：HF_DATASET_REPO=YOUR_USERNAME/webai2api-data');
    process.exit(1);
}

if (!HF_TOKEN) {
    console.error('❌ 错误：未设置 HF_TOKEN 环境变量');
    console.error('请在 Space Settings 中添加：HF_TOKEN（需要 read 权限）');
    process.exit(1);
}

console.log('📦 Dataset:', HF_DATASET_REPO);
console.log('📁 数据目录:', DATA_DIR);
console.log('');

try {
    // 1. 创建临时目录
    console.log('📂 创建临时目录...');
    if (fs.existsSync(TEMP_DIR)) {
        execSync(`rm -rf ${TEMP_DIR}`);
    }
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    // 2. 克隆 Dataset
    console.log('🔽 克隆 Dataset...');
    const repoUrl = `https://hf.co/${HF_DATASET_REPO}`;
    execSync(`cd ${TEMP_DIR} && git clone https://user:${HF_TOKEN}@${repoUrl} .`, { 
        stdio: 'inherit',
        timeout: 60000 // 60 秒超时
    });

    // 3. 检查是否有数据
    console.log('🔍 检查数据...');
    const files = fs.readdirSync(TEMP_DIR);
    if (files.length === 0 || (files.length === 1 && files[0] === '.git')) {
        console.warn('⚠️  Dataset 中没有数据');
        console.warn('跳过恢复，将使用新的浏览器实例');
        process.exit(0);
    }

    // 4. 创建数据目录
    console.log('📁 创建数据目录...');
    if (fs.existsSync(DATA_DIR)) {
        execSync(`rm -rf ${DATA_DIR}`);
    }
    fs.mkdirSync(DATA_DIR, { recursive: true });

    // 5. 复制数据
    console.log('📋 恢复数据...');
    execSync(`cp -r ${TEMP_DIR}/* ${DATA_DIR}/`);
    console.log('✅ 数据恢复完成');
    console.log('');

    // 6. 显示恢复的文件
    console.log('📄 恢复的文件：');
    const restoredFiles = getAllFiles(DATA_DIR);
    restoredFiles.forEach(file => {
        const relativePath = path.relative(DATA_DIR, file);
        const stats = fs.statSync(file);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`  - ${relativePath} (${size} KB)`);
    });

    console.log('');
    console.log('✅ 数据恢复成功！');
    console.log('📍 Dataset:', `https://huggingface.co/datasets/${HF_DATASET_REPO}`);
    console.log('');
    console.log('浏览器将使用恢复的登录状态。');

} catch (error) {
    console.error('');
    console.error('❌ 恢复失败:', error.message);
    console.error('');
    console.error('可能的原因：');
    console.error('1. Dataset 不存在或为空');
    console.error('2. HF_TOKEN 权限不足（需要 read 权限）');
    console.error('3. HF_DATASET_REPO 名称错误');
    console.error('4. 网络连接问题');
    console.error('');
    console.error('将使用新的浏览器实例（需要重新登录）');
    process.exit(0); // 不退出，允许继续启动
} finally {
    // 清理临时目录
    if (fs.existsSync(TEMP_DIR)) {
        execSync(`rm -rf ${TEMP_DIR}`);
    }
}

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
