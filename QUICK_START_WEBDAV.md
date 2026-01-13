# WebDAV 数据持久化快速指南

## 🚀 快速开始（2 步完成）

### 步骤 1：配置环境变量

在 Hugging Face Space Settings → **Variables** 中添加以下 3 个环境变量：

```
WEBDAV_URL=https://rebun.infini-cloud.net/dav
WEBDAV_USER=iyougame
WEBDAV_PASS=exzgmqInkoFADbjOx1ak_reGVIf_ptIZxYUtBFp3mLw
```

保存后，Space 会自动重启。

### 步骤 2：完成

✅ 配置完成！现在可以使用 WebDAV 保存和恢复浏览器数据了。

---

## 📖 使用流程

### 首次使用（登录模式）

1. **启动 Space**（首次，无数据）
   ```
   Space 自动启动，检测到无数据
   ```

2. **访问 WebUI**
   ```
   https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   ```

3. **连接虚拟显示器**
   - 点击 "🎨 访问 WebUI"
   - 在 WebUI 中找到 "虚拟显示器" 板块
   - 点击连接

4. **完成登录**
   - 在虚拟显示器中登录所需的 AI 网站
   - 发送测试消息验证
   - 确保登录状态正常

5. **保存数据到 WebDAV**
   - 在 Space 的终端中执行：
     ```bash
     npm run save-data-webdav
     ```
   - 等待上传完成（约 10-30 秒）
   - 看到 "✅ 数据保存成功" 即可

### 后续使用（自动恢复）

1. **启动 Space**
   ```
   Space 自动启动
   检测到 WebDAV 环境变量
   自动从 WebDAV 恢复数据
   ```

2. **直接使用**
   - 浏览器已恢复登录状态
   - 无需重新登录
   - 直接调用 API

---

## 🛠️ 常用命令

### 保存数据到 WebDAV
```bash
npm run save-data-webdav
```
**使用场景**：
- 首次登录完成后
- 更新登录状态后
- 定期备份

### 从 WebDAV 恢复数据
```bash
npm run restore-data-webdav
```
**使用场景**：
- 手动恢复数据
- 数据丢失后恢复

### 清除本地数据
```bash
npm run clear-data
```
**使用场景**：
- 清除本地数据
- 重新登录前
- 5 秒倒计时，可取消

---

## ⚠️ 注意事项

1. **首次使用必须手动保存**
   - 自动恢复只在有数据时生效
   - 首次登录后必须手动执行 `npm run save-data-webdav`

2. **Cookie 过期问题**
   - 如果 Cookie 过期，需要重新登录
   - 重新登录后执行 `npm run save-data-webdav`

3. **WebDAV 连接**
   - 确保 WebDAV 服务器可访问
   - 检查用户名和密码
   - 网络问题可能导致上传/下载失败

4. **数据隐私**
   - WebDAV 服务器由您自己控制
   - 确保密码安全
   - 定期更换密码

---

## 🔧 故障排除

### 问题 1：自动恢复失败

**症状**：
```
⚠️  数据恢复失败，将使用新的浏览器实例
```

**解决方案**：
1. 检查环境变量是否正确
2. 检查 WebDAV 服务器是否可访问
3. 检查用户名和密码
4. 手动执行 `npm run restore-data-webdav`

### 问题 2：保存失败

**症状**：
```
❌ 保存失败: ...
```

**解决方案**：
1. 检查 WebDAV 服务器连接
2. 检查用户名和密码
3. 检查网络连接
4. 确保已登录

### 问题 3：需要重新登录

**原因**：Cookie 过期

**解决方案**：
1. 清除数据：`npm run clear-data`
2. 重新登录
3. 保存数据：`npm run save-data-webdav`

### 问题 4：连接超时

**原因**：WebDAV 服务器响应慢或网络问题

**解决方案**：
1. 检查网络连接
2. 检查 WebDAV 服务器状态
3. 重试保存/恢复操作

---

## 💡 最佳实践

1. **定期保存**
   - 每次登录后立即保存
   - 定期检查数据状态

2. **备份策略**
   - WebDAV 服务器可以配置备份
   - 定期导出关键数据

3. **安全建议**
   - 使用强密码
   - 定期更换密码
   - 监控访问日志

4. **成本控制**
   - WebDAV 完全免费
   - 无流量限制
   - 无存储限制（取决于您的 WebDAV 服务）

---

## 📊 数据大小

浏览器数据通常包含：
- Cookies: ~10 KB
- LocalStorage: ~50 KB
- SessionStorage: ~10 KB
- Cache: ~100-500 KB
- 其他: ~50-100 KB

**总计**: 约 200-700 KB

上传/下载时间：
- 上传: ~10-30 秒
- 下载: ~5-15 秒

---

## 🎯 完整示例

### 场景：首次部署

```bash
# 1. 配置环境变量（在 Space Settings 中）
# WEBDAV_URL=https://rebun.infini-cloud.net/dav
# WEBDAV_USER=iyougame
# WEBDAV_PASS=exzgmqInkoFADbjOx1ak_reGVIf_ptIZxYUtBFp3mLw

# 2. Space 自动重启

# 3. 访问 WebUI 并登录
# URL: https://huggingface.co/spaces/iudd/webai2api
# 在虚拟显示器中登录

# 4. 保存数据到 WebDAV
npm run save-data-webdav

# ✅ 完成！下次启动自动恢复
```

### 场景：日常使用

```bash
# 1. 启动 Space
# 自动恢复数据（无需操作）

# 2. 直接使用 API
curl https://huggingface.co/spaces/iudd/webai2api/v1/models

# 3. 如果需要更新登录状态
# 在 WebUI 中重新登录
npm run save-data-webdav
```

---

## 🔐 安全提示

1. **不要公开密码**
   - 密码保存在 Space Settings 中（私密）
   - 不要在代码中硬编码密码
   - 不要在公开仓库中提交密码

2. **定期更换密码**
   - 建议每月更换一次
   - 更换后更新 Space Settings

3. **监控访问**
   - 定期检查 WebDAV 访问日志
   - 发现异常及时更换密码

---

## 📞 获取帮助

- **WebDAV 服务器**: https://rebun.infini-cloud.net
- **文档**: [PERSISTENCE_SOLUTIONS.md](PERSISTENCE_SOLUTIONS.md)
- **Issues**: https://github.com/foxhui/WebAI2API/issues
- **Hugging Face Discord**: https://discord.gg/huggingface

---

## 💰 成本对比

| 方案 | 成本 | 限制 | 推荐度 |
|------|------|------|--------|
| **WebDAV** | 免费 | 无 | ✅✅✅✅ |
| Hugging Face Datasets | 免费 | 有流量限制 | ✅✅✅ |
| 持久化存储 | $5/月 | 10GB | ✅✅ |

**推荐**：使用 WebDAV，完全免费且无限制！

---

**提示**：首次使用建议先在本地测试，确认流程后再部署到 Space。
