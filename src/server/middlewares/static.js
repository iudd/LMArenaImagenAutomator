import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 静态文件中间件
 * 用于服务 public 目录下的静态文件
 */
export function serveStatic(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // 只处理根路径
    if (url.pathname === '/' || url.pathname === '/index.html') {
        const indexPath = path.join(__dirname, '../../public/index.html');
        
        // 检查文件是否存在
        if (fs.existsSync(indexPath)) {
            try {
                const content = fs.readFileSync(indexPath, 'utf-8');
                res.writeHead(200, {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Content-Length': Buffer.byteLength(content)
                });
                res.end(content);
                return true;
            } catch (err) {
                console.error('读取静态文件失败:', err);
            }
        }
    }
    
    return false;
}
