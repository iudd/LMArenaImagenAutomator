#!/usr/bin/env node

/**
 * 远程服务器状态检查脚本
 * 用于检查 LMArenaImagenAutomator 在远程服务器上的运行状态
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// 状态文件路径
const STATUS_FILE = path.join(process.cwd(), 'data', 'login-status.json');
const LOG_FILE = path.join(process.cwd(), 'logs', 'app.log'); // 假设日志文件位置

/**
 * 检查登录状态文件
 */
function checkLoginStatus() {
    console.log('\n=== 登录状态检查 ===');
    
    if (fs.existsSync(STATUS_FILE)) {
        try {
            const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
            console.log('✅ 登录状态文件存在');
            console.log(`📅 最后更新时间: ${new Date(status.timestamp).toLocaleString()}`);
            console.log(`🌐 当前页面: ${status.title || 'Unknown'}`);
            console.log(`🔗 URL: ${status.url || 'Unknown'}`);
            console.log(`🍪 Cookie数量: ${status.cookies ? status.cookies.length : 0}`);
            console.log(`💾 localStorage项目: ${status.localStorage ? Object.keys(status.localStorage).length : 0}`);
            
            // 检查时间戳是否太旧（超过24小时）
            const lastUpdate = new Date(status.timestamp);
            const now = new Date();
            const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                console.log('⚠️  警告: 登录状态超过24小时，可能需要重新登录');
            } else {
                console.log('✅ 登录状态有效');
            }
            
            return true;
        } catch (e) {
            console.log('❌ 登录状态文件损坏:', e.message);
            return false;
        }
    } else {
        console.log('❌ 登录状态文件不存在');
        return false;
    }
}

/**
 * 检查进程状态
 */
function checkProcessStatus() {
    console.log('\n=== 进程状态检查 ===');
    
    return new Promise((resolve) => {
        // 检查是否有node进程在运行
        const ps = spawn('ps', ['aux'], { stdio: 'pipe' });
        let output = '';
        
        ps.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        ps.on('close', (code) => {
            const lines = output.split('\n');
            const nodeProcesses = lines.filter(line => 
                line.includes('node') && 
                line.includes('server.js') && 
                !line.includes('grep')
            );
            
            if (nodeProcesses.length > 0) {
                console.log('✅ 检测到运行中的进程:');
                nodeProcesses.forEach((line, index) => {
                    const parts = line.trim().split(/\s+/);
                    console.log(`   ${index + 1}. PID: ${parts[1]}, CPU: ${parts[2]}%, MEM: ${parts[3]}%`);
                });
                resolve(true);
            } else {
                console.log('❌ 未检测到运行中的进程');
                resolve(false);
            }
        });
        
        ps.on('error', (err) => {
            console.log('❌ 检查进程失败:', err.message);
            resolve(false);
        });
    });
}

/**
 * 检查最近的日志
 */
function checkRecentLogs() {
    console.log('\n=== 最近日志检查 ===');
    
    if (fs.existsSync(LOG_FILE)) {
        try {
            const stats = fs.statSync(LOG_FILE);
            console.log(`📋 日志文件大小: ${Math.round(stats.size / 1024)}KB`);
            console.log(`📅 最后修改时间: ${stats.mtime.toLocaleString()}`);
            
            // 读取最后10行
            const content = fs.readFileSync(LOG_FILE, 'utf8');
            const lines = content.split('\n');
            const lastLines = lines.slice(-10).filter(line => line.trim());
            
            if (lastLines.length > 0) {
                console.log('📝 最近10条日志:');
                lastLines.forEach((line, index) => {
                    console.log(`   ${index + 1}. ${line}`);
                });
            }
            
            return true;
        } catch (e) {
            console.log('❌ 读取日志文件失败:', e.message);
            return false;
        }
    } else {
        console.log('❌ 日志文件不存在');
        console.log('💡 提示: 日志文件可能位于其他位置或日志功能未启用');
        return false;
    }
}

/**
 * 检查数据目录
 */
function checkDataDirectory() {
    console.log('\n=== 数据目录检查 ===');
    
    const dataDir = path.join(process.cwd(), 'data');
    
    if (fs.existsSync(dataDir)) {
        console.log('✅ 数据目录存在');
        
        try {
            const items = fs.readdirSync(dataDir);
            console.log(`📁 目录内容: ${items.join(', ')}`);
            
            // 检查Chrome用户数据目录
            const chromeDataDir = path.join(dataDir, 'chromeUserData');
            if (fs.existsSync(chromeDataDir)) {
                console.log('✅ Chrome用户数据目录存在');
                
                // 检查目录大小（简单估算）
                const size = getDirectorySize(chromeDataDir);
                console.log(`📊 Chrome数据大小: ${Math.round(size / 1024 / 1024)}MB`);
            } else {
                console.log('❌ Chrome用户数据目录不存在');
            }
            
            return true;
        } catch (e) {
            console.log('❌ 读取数据目录失败:', e.message);
            return false;
        }
    } else {
        console.log('❌ 数据目录不存在');
        return false;
    }
}

/**
 * 获取目录大小（简单实现）
 */
function getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                totalSize += getDirectorySize(itemPath);
            } else {
                totalSize += stats.size;
            }
        }
    } catch (e) {
        // 忽略权限错误等
    }
    
    return totalSize;
}

/**
 * 生成状态报告
 */
function generateReport(results) {
    console.log('\n=== 状态总结 ===');
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`📊 总体状态: ${passed}/${total} 项检查通过 (${percentage}%)`);
    
    if (percentage >= 75) {
        console.log('✅ 系统状态良好');
    } else if (percentage >= 50) {
        console.log('⚠️  系统状态一般，建议检查失败项');
    } else {
        console.log('❌ 系统状态异常，需要立即处理');
    }
    
    // 提供建议
    console.log('\n=== 建议 ===');
    
    if (!results.login) {
        console.log('🔄 建议重新运行登录命令: npm run start -- -login-console');
    }
    
    if (!results.process) {
        console.log('🔄 建议重启应用程序: npm start');
    }
    
    if (!results.data) {
        console.log('🔄 建议检查应用权限和配置');
    }
    
    if (results.login && results.process) {
        console.log('✅ 应用程序运行正常，可以接受API请求');
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🔍 LMArenaImagenAutomator 远程服务器状态检查');
    console.log('=' .repeat(50));
    
    const results = {
        login: checkLoginStatus(),
        process: await checkProcessStatus(),
        logs: checkRecentLogs(),
        data: checkDataDirectory()
    };
    
    generateReport(results);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 检查完成');
}

// 运行检查
main().catch(console.error);