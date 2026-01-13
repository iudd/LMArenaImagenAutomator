#!/usr/bin/env node

/**
 * 保存浏览器数据到 Hugging Face Dataset
 * 
 * 使用方法：
 *   node scripts/save-data.js
 * 
 * 环境变量：
 *   HF_DATASET_REPO: Dataset 仓库（如：iudd/webai2api-data）
 *   HF_TOKEN: Hugging Face Token（需要 write 权限）
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据目录
const DATA_DIR = path.join(__dirname, '../data/camoufoxUserData');
const TEMP_DIR = '/tmp/webai2api-data';

// 环境变量
const HF_DATASET_REPO = process.env.HF_DATASET_REPO;
const HF_TOKEN = process.env.HF_TOKEN;

console.log('==========================================');
console.log('WebAI2API - 数据保存脚本');
console.log('==========================================');

// 检查环境变量
if (!HF_DATASET_REPO) {
    console.error('❌ 错误：未设置 HF_DATASET_REPO 环境变量');
    console.error('请在 Space Settings 中添加：HF_DATASET_REPO=YOUR_USERNAME/webai2api-data');
    process.exit(1);
}

if (!HF_TOKEN) {
    console.error('❌ 错误：未设置 HF_TOKEN 环境变量');
    console.error('请在 Space Settings 中添加：HF_TOKEN（需要 write 权限）');
    process.exit(1);
}

// 检查数据目录是否存在
if (!fs.existsSync(DATA_DIR)) {
    console.error('❌ 错误：数据目录不存在', DATA_DIR);
    console.error('请先启动服务并完成登录');
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

    // 2. 复制数据到临时目录
    console.log('📋 复制数据...');
    execSync(`cp -r ${DATA_DIR}/* ${TEMP_DIR}/`);
    console.log('✅ 数据复制完成');
    console.log('');

    // 3. 初始化 Git 仓库
    console.log('🔧 初始化 Git 仓库...');
    execSync(`cd ${TEMP_DIR} && git init`, { stdio: 'inherit' });
    execSync(`cd ${TEMP_DIR} && git config user.name "WebAI2API"`, { stdio: 'inherit' });
    execSync(`cd ${TEMP_DIR} && git config user.email "webai2api@huggingface.co"`, { stdio: 'inherit' });

    // 4. 添加远程仓库
    console.log('🔗 添加远程仓库...');
    const repoUrl = `https://hf.co/${HF_DATASET_REPO}`;
    execSync(`cd ${TEMP_DIR} && git remote add origin https://user:${HF_TOKEN}@${repoUrl}`, { stdio: 'inherit' });

    // 5. 添加文件
    console.log('📝 添加文件...');
    execSync(`cd ${TEMP_DIR} && git add .`, { stdio: 'inherit' });

    // 6. 提交
    console.log('💾 提交更改...');
    const timestamp = new Date().toISOString();
    execSync(`cd ${TEMP_DIR} && git commit -m "Save browser data - ${timestamp}"`, { stdio: 'inherit' });

    // 7. 推送
    console.log('🚀 推送到 Hugging Face Dataset...');
    execSync(`cd ${TEMP_DIR} && git push -u origin main --force`, { stdio: 'inherit' });

    console.log('');
    console.log('✅ 数据保存成功！');
    console.log('📍 Dataset:', `https://huggingface.co/datasets/${HF_DATASET_REPO}`);
    console.log('');
    console.log('下次启动时，数据将自动恢复。');

} catch (error) {
    console.error('');
    console.error('❌ 保存失败:', error.message);
    console.error('');
    console.error('可能的原因：');
    console.error('1. HF_TOKEN 权限不足（需要 write 权限）');
    console.error('2. HF_DATASET_REPO 名称错误');
    console.error('3. 网络连接问题');
    console.error('4. Dataset 不存在或无权限访问');
    process.exit(1);
} finally {
    // 清理临时目录
    if (fs.existsSync(TEMP_DIR)) {
        execSync(`rm -rf ${TEMP_DIR}`);
    }
}
