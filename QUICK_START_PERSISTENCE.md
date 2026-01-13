# Hugging Face Space 数据持久化快速指南

## 🚀 快速开始（3 步完成）

### 步骤 1：创建 Dataset

1. 访问 https://huggingface.co/datasets/new
2. 输入名称：`YOUR_USERNAME/webai2api-data`
3. 选择：**Private**（保护隐私）
4. 点击 **Create**

### 步骤 2：获取 Token

1. 访问 https://huggingface.co/settings/tokens
2. 点击 **New token**
3. Token name: `webai2api-space`
4. 权限选择：**write**
5. 点击 **Create token**
6. 复制 Token（格式：`hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 步骤 3：配置 Space

在 Space Settings → **Variables** 中添加：

```
HF_DATASET_REPO=YOUR_USERNAME/webai2api-data
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

例如：
```
HF_DATASET_REPO=iudd/webai2api-data
HF_TOKEN=hf_abc123xyz456...
```

保存后，Space 会自动重启。

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

5. **保存数据**
   - 在 Space 的终端中执行：
     ```bash
     npm run save-data
     ```
   - 等待上传完成（约 1-2 分钟）
   - 看到 "✅ 数据保存成功" 即可

### 后续使用（自动恢复）

1. **启动 Space**
   ```
   Space 自动启动
   检测到环境变量
   自动从 Dataset 恢复数据
   ```

2. **直接使用**
   - 浏览器已恢复登录状态
   - 无需重新登录
   - 直接调用 API

---

## 🛠️ 常用命令

### 保存数据
```bash
npm run save-data
```
**使用场景**：
- 首次登录完成后
- 更新登录状态后
- 定期备份

### 恢复数据
```bash
npm run restore-data
```
**使用场景**：
- 手动恢复数据
- 数据丢失后恢复

### 清除数据
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
   - 首次登录后必须手动执行 `npm run save-data`

2. **Cookie 过期问题**
   - 如果 Cookie 过期，需要重新登录
   - 重新登录后执行 `npm run save-data`

3. **数据隐私**
   - Dataset 设置为 **Private**
   - 不要将 Token 泄露
   - 定期更换 Token

4. **网络问题**
   - 上传/下载需要时间
   - 如果失败，重试即可
   - 检查网络连接

---

## 🔧 故障排除

### 问题 1：自动恢复失败

**症状**：
```
⚠️  数据恢复失败，将使用新的浏览器实例
```

**解决方案**：
1. 检查环境变量是否正确
2. 检查 Dataset 是否存在
3. 检查 Token 权限（需要 read）
4. 手动执行 `npm run restore-data`

### 问题 2：保存失败

**症状**：
```
❌ 保存失败: ...
```

**解决方案**：
1. 检查 Token 权限（需要 write）
2. 检查 Dataset 名称
3. 检查网络连接
4. 确保已登录

### 问题 3：需要重新登录

**原因**：Cookie 过期

**解决方案**：
1. 清除数据：`npm run clear-data`
2. 重新登录
3. 保存数据：`npm run save-data`

---

## 💡 最佳实践

1. **定期保存**
   - 每次登录后立即保存
   - 定期检查数据状态

2. **备份策略**
   - 保留多个版本（Dataset 自动版本控制）
   - 定期导出关键数据

3. **安全建议**
   - 使用强密码
   - 定期更换 Token
   - 监控访问日志

4. **成本控制**
   - Dataset 存储免费
   - 流量免费
   - 无额外成本

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
# 1. 创建 Dataset（在网页上操作）
# 访问：https://huggingface.co/datasets/new
# 名称：iudd/webai2api-data
# 类型：Private

# 2. 获取 Token（在网页上操作）
# 访问：https://huggingface.co/settings/tokens
# 权限：write
# 复制 Token

# 3. 配置环境变量（在 Space Settings 中）
# HF_DATASET_REPO=iudd/webai2api-data
# HF_TOKEN=hf_abc123...

# 4. Space 自动重启

# 5. 访问 WebUI 并登录
# URL: https://huggingface.co/spaces/iudd/webai2api
# 在虚拟显示器中登录

# 6. 保存数据
npm run save-data

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
npm run save-data
```

---

## 📞 获取帮助

- **文档**: [PERSISTENCE_SOLUTIONS.md](PERSISTENCE_SOLUTIONS.md)
- **Issues**: https://github.com/foxhui/WebAI2API/issues
- **Hugging Face Discord**: https://discord.gg/huggingface

---

**提示**：首次使用建议先在本地测试，确认流程后再部署到 Space。
