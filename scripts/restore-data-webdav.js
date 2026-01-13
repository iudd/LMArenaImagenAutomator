#!/usr/bin/env node

/**
 * 从 WebDAV 恢复浏览器数据
 * 
 * 使用方法：
 *   node scripts/restore-data-webdav.js
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

// 环境变量
const WEBDAV_URL = process.env.WEBDAV_URL;
const WEBDAV_USER = process.env.WEBDAV_USER;
const WEBDAV_PASS = process.env.WEBDAV_PASS;

console.log('==========================================');
console.log('WebAI2API - WebDAV 数据恢复脚本');
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

    // 2. 检查远程目录是否存在
    const remoteDir = '/webai2api-data';
    console.log('🔍 检查远程目录:', remoteDir);
    
    try {
        await client.getDirectoryContents(remoteDir);
    } catch (err) {
        console.warn('⚠️  远程目录不存在，跳过恢复');
        console.warn('将使用新的浏览器实例（需要重新登录）');
        process.exit(0);
    }

    console.log('✅ 远程目录存在');
    console.log('');

    // 3. 创建本地数据目录
    console.log('📁 创建本地数据目录...');
    if (fs.existsSync(DATA_DIR)) {
        fs.rmSync(DATA_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DATA_DIR, { recursive: true });

    // 4. 下载文件
    console.log('📥 开始下载文件...');
    let downloadedFiles = 0;
    let totalSize = 0;

    const downloadFile = async (remotePath, localPath) => {
        try {
            const content = await client.getFileContents(remotePath, { format: 'text' });
            
            // 检查是否是目录（通过检查是否抛出错误）
            const stats = await client.stat(remotePath);
            
            if (stats.type === 'directory') {
                // 创建本地目录
                fs.mkdirSync(localPath, { recursive: true });
                
                // 递归下载子文件
                const contents = await client.getDirectoryContents(remotePath);
                for (const item of contents) {
                    await downloadFile(
                        path.join(remotePath, item.basename),
                        path.join(localPath, item.basename)
                    );
                }
            } else {
                // 下载文件
                fs.writeFileSync(localPath, content);
                downloadedFiles++;
                totalSize += stats.size;
                console.log(`  ✓ ${path.relative(DATA_DIR, localPath)} (${(stats.size / 1024).toFixed(2)} KB)`);
            }
        } catch (err) {
            console.error(`  ✗ ${remotePath}: ${err.message}`);
            throw err;
        }
    };

    const contents = await client.getDirectoryContents(remoteDir);
    for (const item of contents) {
        await downloadFile(
            path.join(remoteDir, item.basename),
            path.join(DATA_DIR, item.basename)
        );
    }

    console.log('');
    console.log('==========================================');
    console.log('✅ 数据恢复成功！');
    console.log('==========================================');
    console.log('📊 下载统计:');
    console.log(`  - 文件数量: ${downloadedFiles}`);
    console.log(`  - 总大小: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`  - 远程目录: ${remoteDir}`);
    console.log('');
    console.log('浏览器将使用恢复的登录状态。');

} catch (error) {
    console.error('');
    console.error('❌ 恢复失败:', error.message);
    console.error('');
    console.error('可能的原因：');
    console.error('1. WebDAV 配置错误');
    console.error('2. 网络连接问题');
    console.error('3. WebDAV 服务器不可用');
    console.error('4. 用户名或密码错误');
    console.error('5. 远程数据损坏');
    console.error('');
    console.error('将使用新的浏览器实例（需要重新登录）');
    process.exit(0); // 不退出，允许继续启动
}
