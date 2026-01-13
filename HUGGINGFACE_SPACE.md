# Hugging Face Space 部署指南

## 📋 前置要求

- Hugging Face 账号
- 推荐使用 **CPU Basic** 或更高级别的 Space（免费版可能资源不足）

## 🚀 部署步骤

### 1. 创建 Space

1. 访问 https://huggingface.co/spaces
2. 点击 "Create new Space"
3. 配置：
   - **Owner**: 选择您的账号
   - **Space name**: 输入名称（如 `webai2api`）
   - **SDK**: 选择 **Docker**
   - **Hardware**: 推荐 **CPU Basic**（$0.10/小时）或更高
   - **Visibility**: Public 或 Private

### 2. 推送代码

```bash
# 克隆 Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
cd YOUR_SPACE_NAME

# 添加远程仓库
git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME

# 推送 webai2hf 分支
git push origin webai2hf:main
```

### 3. 配置环境变量（可选）

在 Space 的 **Settings** → **Variables** 中添加：

- `AUTH_TOKEN`: API 鉴权密钥（可选，不设置则使用配置文件中的值）

### 4. 等待构建

- 首次构建需要 5-10 分钟
- 构建完成后服务自动启动
- 浏览器初始化需要 30-60 秒

## ⚠️ 重要提示

### 资源限制

| 硬件类型 | CPU | 内存 | 价格 | 推荐度 |
|---------|-----|------|------|--------|
| CPU Basic | 2 vCPU | 16 GB | $0.10/小时 | ✅ 推荐 |
| CPU Upgrade | 4 vCPU | 32 GB | $0.30/小时 | ✅✅ 最佳 |
| CPU XL | 8 vCPU | 64 GB | $0.80/小时 | ✅✅✅ 极佳 |

**免费版**（CPU tiny）资源严重不足，**不推荐**使用。

### 内存优化

已针对 Hugging Face Space 进行了以下优化：

1. **关闭 Fission**：`fission: false`（内存从 ~2GB 降至 ~1GB）
2. **使用无头模式**：`headless: true`（节省显示资源）
3. **减少队列缓冲**：`queueBuffer: 1`
4. **限制图片数量**：`imageLimit: 3`

### 首次使用

1. **访问 Space URL**：`https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`
2. **点击 "🎨 访问 WebUI"**
3. **完成账号登录**：
   - 在 WebUI 中找到适配器管理
   - 手动登录所需的 AI 网站
   - 发送测试消息验证

## 🔧 故障排除

### 问题 1：服务器被暂停（SIGTERM）

**原因**：内存超限或启动超时

**解决方案**：
1. 升级到 **CPU Basic** 或更高级别的 Space
2. 检查日志查看具体错误
3. 确保使用优化配置 `config.hf.yaml`

### 问题 2：浏览器启动失败

**原因**：资源不足或配置错误

**解决方案**：
1. 检查 Space 硬件配置
2. 查看 Space Logs 中的错误信息
3. 确认配置文件正确

### 问题 3：无法访问虚拟显示器

**原因**：Hugging Face Space 网络限制

**解决方案**：
1. 通过 WebUI 的 VNC 功能访问
2. 不支持直接 VNC 客户端连接
3. 使用 WebUI 进行所有操作

### 问题 4：API 返回 503

**原因**：浏览器初始化未完成或配置错误

**解决方案**：
1. 等待 30-60 秒让浏览器完全启动
2. 检查 `/v1/models` 端点是否正常
3. 查看 Space Logs 确认浏览器已启动

## 📊 监控和日志

### 查看日志

1. 访问 Space 页面
2. 点击 **"Logs"** 标签
3. 查看实时日志输出

### 健康检查

访问以下端点检查服务状态：

- `GET /` - 首页（显示服务状态）
- `GET /v1/models` - 模型列表（API 是否正常）

## 💰 成本估算

以 **CPU Basic** 为例：

- **空闲时**：$0.10/小时 = $2.40/天 = $72/月
- **使用时**：相同费用（按小时计费）

**建议**：
- 只在需要时启动 Space
- 使用后及时暂停或删除
- 考虑使用其他更便宜的云服务

## 🔄 更新部署

```bash
# 拉取最新代码
git pull origin main

# 推送更新
git push origin main
```

Space 会自动重新构建和部署。

## 📞 获取帮助

- **GitHub Issues**: https://github.com/foxhui/WebAI2API/issues
- **文档**: https://foxhui.github.io/WebAI2API/
- **Hugging Face Discord**: https://discord.gg/huggingface

## 📝 配置说明

### config.hf.yaml 优化配置

```yaml
server:
  port: 7860

browser:
  headless: true      # 无头模式节省资源
  fission: false      # 关闭站点隔离降低内存

queue:
  queueBuffer: 1      # 减少队列缓冲
  imageLimit: 3       # 限制图片数量
```

## ⚡ 性能优化建议

1. **使用付费版 Space**：免费版资源严重不足
2. **按需启动**：不需要时暂停 Space
3. **监控资源使用**：定期查看 CPU 和内存使用情况
4. **优化配置**：根据实际需求调整配置参数

## 🎯 使用场景

### 适合

- ✅ 测试和演示
- ✅ 临时使用
- ✅ 小规模应用

### 不适合

- ❌ 高并发生产环境
- ❌ 长时间运行
- ❌ 大规模应用

**建议**：生产环境使用自己的服务器或云服务（如 AWS、阿里云等）。
