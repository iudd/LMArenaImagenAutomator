/**
 * @fileoverview 后端适配器公共流程
 * @description 提供各适配器复用的通用页面操作与错误归一化能力。
 *
 * 主要函数：
 * - `fillPrompt`：拟人化输入提示词
 * - `submit`：提交表单（点击按钮失败则回退为回车）
 * - `waitApiResponse`：等待匹配的 API 响应（包含页面关闭/崩溃监听）
 * - `normalizePageError`：将页面级异常归一化为可返回给服务器层的错误
 * - `normalizeHttpError`：将 HTTP 响应错误（含限流/人机验证）归一化
 * - `waitForPageAuth`/`lockPageAuth`...：页面认证锁机制，防止多任务并发冲突
 * - `waitForInput`: 等待输入框就绪
 */

import { sleep, humanType, safeClick, isPageValid, createPageCloseWatcher, getRealViewport, clamp, random } from '../browser/utils.js';
import { logger } from '../utils/logger.js';

// ==========================================
// 页面认证锁工具函数
// ==========================================

/**
 * 等待页面认证完成
 * @param {import('playwright-core').Page} page - 页面对象
 */
export async function waitForPageAuth(page) {
    while (page.authState?.isHandlingAuth) {
        await sleep(500, 1000);
    }
}

/**
 * 设置页面认证锁（加锁）
 * @param {import('playwright-core').Page} page - 页面对象
 */
export function lockPageAuth(page) {
    if (page.authState) page.authState.isHandlingAuth = true;
}

/**
 * 释放页面认证锁（解锁）
 * @param {import('playwright-core').Page} page - 页面对象
 */
export function unlockPageAuth(page) {
    if (page.authState) page.authState.isHandlingAuth = false;
}

/**
 * 检查页面是否正在处理认证
 * @param {import('playwright-core').Page} page - 页面对象
 * @returns {boolean}
 */
export function isPageAuthLocked(page) {
    return page.authState?.isHandlingAuth === true;
}

/**
 * 等待输入框出现（自动等待认证完成）
 * 
 * 使用轮询方式等待输入框出现，同时尊重页面认证锁。
 * 当页面正在处理登录跳转时会自动暂停检测。
 * 
 * @param {import('playwright-core').Page} page - 页面对象
 * @param {string|import('playwright-core').Locator} selectorOrLocator - 输入框选择器或 Locator 对象
 * @param {object} [options={}] - 选项
 * @param {number} [options.timeout=60000] - 超时时间（毫秒）
 * @param {boolean} [options.click=true] - 找到后是否点击输入框
 * @returns {Promise<void>}
 */
export async function waitForInput(page, selectorOrLocator, options = {}) {
    const { timeout = 60000, click = true } = options;

    // 判断是选择器字符串还是 Locator 对象
    const isLocator = typeof selectorOrLocator !== 'string';
    const displayName = isLocator ? 'Locator' : selectorOrLocator;

    const startTime = Date.now();

    // 等待认证完成（如果正在处理登录跳转）
    while (isPageAuthLocked(page)) {
        if (Date.now() - startTime >= timeout) break;
        await sleep(500, 1000);
    }

    // 计算剩余超时时间
    const elapsed = Date.now() - startTime;
    const remainingTimeout = Math.max(timeout - elapsed, 5000);

    // 等待输入框出现 - 对字符串选择器使用 waitForSelector，对 Locator 使用 waitFor
    if (isLocator) {
        await selectorOrLocator.first().waitFor({ state: 'visible', timeout: remainingTimeout }).catch(() => {
            throw new Error(`未找到输入框 (${displayName})`);
        });
    } else {
        await page.waitForSelector(selectorOrLocator, { timeout: remainingTimeout }).catch(() => {
            throw new Error(`未找到输入框 (${displayName})`);
        });
    }

    if (click) {
        const target = isLocator ? selectorOrLocator : selectorOrLocator;
        await safeClick(page, target, { bias: 'input' });
        await sleep(500, 1000);
    }
}

// ==========================================

/**
 * 任务完成后移开鼠标（拟人化行为）
 * 
 * @param {import('playwright-core').Page} page - Playwright 页面对象
 */
export async function moveMouseAway(page) {
    if (!page.cursor) return;

    try {
        const vp = await getRealViewport(page);
        await page.cursor.moveTo({
            x: clamp(vp.safeWidth * random(0.85, 0.95), 0, vp.safeWidth),
            y: clamp(vp.height * random(0.3, 0.7), 0, vp.safeHeight)
        });
    } catch (e) {
        // 忽略鼠标移动失败
    }
}

/**
 * 填写提示词 (通用)
 * @param {import('playwright-core').Page} page - Playwright 页面对象
 * @param {string|import('playwright-core').ElementHandle} target - 输入目标（选择器或元素句柄）
 * @param {string} prompt - 提示词内容
 * @param {object} [meta={}] - 日志元数据
 */
export async function fillPrompt(page, target, prompt, meta = {}) {
    logger.info('适配器', '正在输入提示词...', meta);
    await humanType(page, target, prompt);
    await sleep(800, 1500);
}

/**
 * 提交表单 (带回退逻辑)
 * 
 * 尝试点击指定按钮，失败时回退到按回车提交
 * 
 * @param {import('playwright-core').Page} page - Playwright 页面对象
 * @param {object} options - 提交选项
 * @param {string} options.btnSelector - 按钮选择器
 * @param {string|import('playwright-core').ElementHandle} [options.inputTarget] - 输入框（回退时使用）
 * @param {object} [options.meta={}] - 日志元数据
 * @returns {Promise<boolean>} 是否成功点击按钮（false 表示使用了回退）
 */
export async function submit(page, options = {}) {
    const { btnSelector, inputTarget, meta = {} } = options;

    try {
        const btnHandle = await page.$(btnSelector);
        if (btnHandle) {
            // 确保按钮在可视区域
            await btnHandle.scrollIntoViewIfNeeded().catch(() => { });
            await sleep(200, 400);
            await safeClick(page, btnHandle, { bias: 'button' });
            return true;
        }
    } catch (e) {
        // 选择器无效或其他错误，继续回退逻辑
    }

    // 回退：按回车提交
    logger.warn('适配器', '未找到发送按钮，尝试回车提交', meta);
    if (inputTarget) {
        if (typeof inputTarget === 'string') {
            await page.focus(inputTarget).catch(() => { });
        } else {
            await inputTarget.focus().catch(() => { });
        }
    }
    await page.keyboard.press('Enter');
    return false;
}

/**
 * 等待 API 响应 (带页面关闭监听)
 * 
 * 使用 Promise.race 同时监听：
 * - API 响应
 * - 页面关闭/崩溃事件
 * 
 * @param {import('playwright-core').Page} page - Playwright 页面对象
 * @param {object} options - 等待选项
 * @param {string} options.urlMatch - URL 匹配字符串（包含关系）
 * @param {string} [options.method='POST'] - HTTP 方法
 * @param {number} [options.timeout=120000] - 超时时间（毫秒）
 * @param {object} [options.meta={}] - 日志元数据
 * @returns {Promise<import('playwright-core').Response>} 响应对象
 * @throws {Error} 页面关闭/崩溃/超时时抛出错误
 */
export async function waitApiResponse(page, options = {}) {
    const { urlMatch, method = 'POST', timeout = 120000, meta = {} } = options;

    // 先检查页面状态
    if (!isPageValid(page)) {
        throw new Error('PAGE_INVALID');
    }

    const pageWatcher = createPageCloseWatcher(page);

    try {
        const responsePromise = page.waitForResponse(
            response =>
                response.url().includes(urlMatch) &&
                response.request().method() === method &&
                (response.status() === 200 || response.status() >= 400),
            { timeout }
        );

        return await Promise.race([responsePromise, pageWatcher.promise]);
    } finally {
        pageWatcher.cleanup();
    }
}

/**
 * 统一处理页面级错误
 * 
 * 处理以下错误类型：
 * - PAGE_CLOSED: 页面被关闭
 * - PAGE_CRASHED: 页面崩溃
 * - PAGE_INVALID: 页面状态无效
 * - TimeoutError: 请求超时
 * 
 * @param {Error} err - 原始错误
 * @param {object} [meta={}] - 日志元数据
 * @returns {{ error: string } | null} 标准化错误对象，未匹配返回 null
 */
export function normalizePageError(err, meta = {}) {
    if (err.message === 'PAGE_CLOSED') {
        logger.error('适配器', '页面已关闭', meta);
        return { error: '页面已关闭，请勿在生图过程中刷新页面' };
    }
    if (err.message === 'PAGE_CRASHED') {
        logger.error('适配器', '页面崩溃', meta);
        return { error: '页面崩溃，请重试' };
    }
    if (err.message === 'PAGE_INVALID') {
        logger.error('适配器', '页面状态无效', meta);
        return { error: '页面状态无效，请重新初始化' };
    }
    if (err.name === 'TimeoutError') {
        logger.error('适配器', '请求超时', meta);
        return { error: '请求超时 (120秒), 请检查网络或稍后重试' };
    }
    return null; // 未匹配到已知错误类型
}

/**
 * 统一处理 HTTP 响应错误
 * 
 * 处理以下错误类型：
 * - 429: 限流 / CAPTCHA
 * - recaptcha validation failed: 人机验证失败
 * - 4xx/5xx: 服务端错误
 * 
 * @param {import('playwright-core').Response} response - HTTP 响应对象
 * @param {string} [content=null] - 响应体内容（可选）
 * @returns {{ error: string, code?: string } | null} 标准化错误对象，无错误返回 null
 */
export function normalizeHttpError(response, content = null) {
    const status = response.status();

    // 429 限流检查
    if (status === 429 || content?.includes('Too Many Requests')) {
        return { error: '触发限流/上游繁忙', code: '429' };
    }

    // reCAPTCHA 验证失败
    if (content?.includes('recaptcha validation failed')) {
        return { error: '触发人机验证', code: 'RECAPTCHA' };
    }

    // 其他客户端/服务端错误
    if (status >= 400) {
        return { error: `上游服务器错误，HTTP错误码: ${status}`, code: String(status) };
    }

    return null;
}

/**
 * 下载图片并转换为 Base64
 * 
 * 根据 camoufoxFingerprints.json 动态生成请求头，保持与浏览器指纹一致
 * 
 * @param {string} url - 图片 URL
 * @param {object} context - 上下文对象，包含 proxyConfig 和 userDataDir
 * @returns {Promise<{ image?: string, error?: string }>} 下载结果
 */
export async function downloadImage(url, context = {}) {
    // 动态导入依赖
    const { gotScraping } = await import('got-scraping');
    const fs = await import('fs');
    const path = await import('path');
    const { getHttpProxy } = await import('../utils/proxy.js');

    const { proxyConfig = null, userDataDir } = context;

    try {
        // 读取指纹文件获取浏览器信息（优先使用 userDataDir 内的指纹）
        let fingerprintPath = userDataDir
            ? path.join(userDataDir, 'fingerprint.json')
            : path.join(process.cwd(), 'data', 'camoufoxUserData', 'fingerprint.json');

        let browserName = 'firefox';
        let browserMinVersion = 100;
        let os = 'windows';
        let locale = 'en-US';

        if (fs.existsSync(fingerprintPath)) {
            try {
                const fingerprint = JSON.parse(fs.readFileSync(fingerprintPath, 'utf8'));
                // 从指纹中提取信息
                if (fingerprint.navigator?.userAgent) {
                    // 解析 User-Agent 获取浏览器版本
                    const versionMatch = fingerprint.navigator.userAgent.match(/Firefox\/(\d+)/i);
                    if (versionMatch) {
                        browserMinVersion = parseInt(versionMatch[1], 10);
                    }
                }
                if (fingerprint.navigator?.platform) {
                    const platform = fingerprint.navigator.platform.toLowerCase();
                    if (platform.includes('win')) os = 'windows';
                    else if (platform.includes('mac')) os = 'macos';
                    else if (platform.includes('linux')) os = 'linux';
                }
                if (fingerprint.navigator?.language) {
                    locale = fingerprint.navigator.language;
                }
            } catch (e) {
                // 解析失败使用默认值
            }
        }

        // 获取代理配置（直接使用传入的 proxyConfig）
        const proxyUrl = await getHttpProxy(proxyConfig);

        const options = {
            url,
            responseType: 'buffer',
            http2: true,
            headerGeneratorOptions: {
                browsers: [{ name: browserName, minVersion: browserMinVersion }],
                devices: ['desktop'],
                locales: [locale],
                operatingSystems: [os],
            }
        };

        if (proxyUrl) {
            options.proxyUrl = proxyUrl;
        }

        const response = await gotScraping(options);
        const base64 = response.body.toString('base64');
        // 根据响应 content-type 生成正确的 MIME 类型
        const contentType = response.headers['content-type'] || 'image/png';
        // 提取 MIME 类型 (去除可能的 charset 等附加信息)
        const mimeType = contentType.split(';')[0].trim();
        return { image: `data:${mimeType};base64,${base64}` };
    } catch (e) {
        return { error: `已获取结果，但图片下载时遇到错误: ${e.message}` };
    }
}
