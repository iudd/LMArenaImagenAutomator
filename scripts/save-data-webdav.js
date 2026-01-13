#!/usr/bin/env node

/**
 * 使用 WebDAV 保存浏览器数据
 * 
 * 使用方法：
 *   node scripts/save-data-webdav.js
 * 
 * 环境变量：
 *   WEBDAV_URL: WebDAV 服务器地址
 *   WEBDAV_USER: WebDAV 用户名
 *   WEBDAV_PASS: WebDAV 密码
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'webdav';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据目录
const DATA_DIR = path.join(__dirname, '../data/camoufoxUserData');
const TEMP_DIR = '/tmp/webai2api-data-webdav';

// 环境变量
const WEBDAV_URL = process.env.WEBDAV_URL;
const WEBDAV_USER = process.env.WEBDAV_USER;
const WEBDAV_PASS = process.env.WEBDAV_PASS;

console.log('==========================================');
console.log('WebAI2API - WebDAV 数据保存脚本');
console.log('==========================================');

// 检查环境变量
if (!WEBDAV_URL || !WEBDAV_USER || !WEBDAV_PASS) {
    console.error('❌ 错误：未设置 WebDAV 环境变量');
    console.error('请在 Space Settings 中添加：');
    console.error('  - WEBDAV_URL: https://rebun.infini-cloud.net/dav');
    console.error('  - WEBDAV_USER: iyougame');
    console.error('  - WEBDAV_PASS: exzgmqInkoFADbjOx1ak_reGVIf_ptIZxYUtBFp3mLw');
    process.exit(1);
}

// 检查数据目录是否存在
if (!fs.existsSync(DATA_DIR)) {
    console.error('❌ 错误：数据目录不存在', DATA_DIR);
    console.error('请先启动服务并完成登录');
    process.exit(1);
}

console.log('🌐 WebDAV URL:', WEBDAV_URL);
console.log('👤 用户:', WEBDAV_USER);
console.log('📁 数据目录:', DATA_DIR);
console.log('');

try {
    // 1. 创建 WebDAV 客户端
    console.log('🔗 连接 WebDAV 服务器...');
    const client = createClient(WEBDAV_URL, {
        username: WEBDAV_USER,
        password: WEBDAV_PASS
    });

    // 2. 测试连接
    await client.getDirectoryContents('/');
    console.log('✅ WebDAV 连接成功');
    console.log('');

    // 3. 创建远程目录
    const remoteDir = '/webai2api-data';
    console.log('📁 创建远程目录:', remoteDir);
    try {
        await client.createDirectory(remoteDir);
    } catch (err) {
        // 目录可能已存在，忽略错误
        if (!err.message.includes('405')) {
            throw err;
        }
    }
    console.log('✅ 远程目录准备完成');
    console.log('');

    // 4. 遍历本地文件并上传
    console.log('📤 开始上传文件...');
    let uploadedFiles = 0;
    let totalSize = 0;

    const uploadFile = async (localPath, remotePath) => {
        const stats = fs.statSync(localPath);
        if (stats.isDirectory()) {
            // 创建远程目录
            try {
                await client.createDirectory(remotePath);
            } catch (err) {
                if (!err.message.includes('405')) {
                    throw err;
                }
            }
            // 递归上传子文件
            const files = fs.readdirSync(localPath);
            for (const file of files) {
                await uploadFile(
                    path.join(localPath, file),
                    path.join(remotePath, file)
                );
            }
        } else {
            // 上传文件
            const content = fs.readFileSync(localPath);
            await client.putFileContents(remotePath, content);
            uploadedFiles++;
            totalSize += stats.size;
            console.log(`  ✓ ${path.relative(DATA_DIR, localPath)} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
    };

    const files = fs.readdirSync(DATA_DIR);
    for (const file of files) {
        await uploadFile(
            path.join(DATA_DIR, file),
            path.join(remoteDir, file)
        );
    }

    console.log('');
    console.log('==========================================');
    console.log('✅ 数据保存成功！');
    console.log('==========================================');
    console.log('📊 上传统计:');
    console.log(`  - 文件数量: ${uploadedFiles}`);
    console.log(`  - 总大小: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`  - 远程目录: ${remoteDir}`);
    console.log('');
    console.log('下次启动时，数据将自动恢复。');

} catch (error) {
    console.error('');
    console.error('❌ 保存失败:', error.message);
    console.error('');
    console.error('可能的原因：');
    console.error('1. WebDAV 配置错误');
    console.error('2. 网络连接问题');
    console.error('3. WebDAV 服务器不可用');
    console.error('4. 用户名或密码错误');
    process.exit(1);
}
