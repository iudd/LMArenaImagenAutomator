# Hugging Face Spaces 部署指南

## 🚀 快速部署

### 方法一：通过 Git 上传（推荐）

1. **准备代码**
   ```bash
   # 确保项目包含以下文件：
   # - Dockerfile
   # - .dockerignore
   # - package.json
   # - pnpm-lock.yaml
   # - server.js
   # - lib/ 目录
   ```

2. **上传到 Hugging Face Spaces**
   - 在 Hugging Face 创建新的 Space
   - 选择 "Docker" SDK
   - 将代码推送到 Space 的 Git 仓库

### 方法二：手动上传文件

1. 在 Hugging Face Spaces 创建新项目
2. 选择 "Docker" SDK
3. 上传以下文件到 Space 的文件管理器：
   - `Dockerfile`
   - `package.json`
   - `pnpm-lock.yaml`
   - `server.js`
   - `lib/` 目录（所有文件）
   - `config.example.yaml`

## ⚙️ 配置说明

### 环境变量

在 Hugging Face Spaces 的 Settings 中设置以下环境变量：

- `NODE_ENV`: `production`
- 其他配置通过 `config.yaml` 文件管理

### 首次运行配置

1. **首次启动**：容器启动后会自动生成 `config.yaml` 文件
2. **手动配置**：如果需要自定义配置，可以：
   - 通过文件管理器上传 `config.yaml`
   - 或者使用 `config.example.yaml` 作为模板

## 🔧 自定义配置

### 修改端口（如果需要）

Hugging Face Spaces 使用 7860 端口对外提供服务，但应用内部使用 3000 端口。如果需要修改：

1. 修改 `Dockerfile` 中的 `EXPOSE` 指令
2. 修改 `server.js` 中的 `PORT` 变量

### 添加自定义配置

在 `config.yaml` 中添加：

```yaml
server:
  port: 3000
  auth: "your-secret-key"
  type: "openai"  # 或 "queue"

chrome:
  headless: true
  gpu: false

queue:
  maxConcurrent: 1
  maxQueueSize: 2
  imageLimit: 5
```

## 📊 监控和日志

### 查看日志

在 Hugging Face Spaces 的 "Logs" 标签页查看容器运行日志。

### 健康检查

应用会自动启动健康检查端点：
- 访问 `/v1/models` 检查服务状态
- 返回 200 状态码表示服务正常

## 🐛 故障排除

### 常见问题

1. **容器启动失败**
   - 检查 `Dockerfile` 语法
   - 确认所有必需文件已上传

2. **依赖安装失败**
   - 检查 `pnpm-lock.yaml` 完整性
   - 确认网络连接正常

3. **浏览器启动失败**
   - 确保配置了正确的 Chrome 路径
   - 检查 GPU 设置（建议禁用）

### 调试模式

如需调试，可以修改 `Dockerfile` 的启动命令：

```dockerfile
# 调试模式（显示浏览器界面）
CMD ["npm", "start", "--", "-login"]
```

## 🔒 安全建议

1. **设置认证密钥**：在 `config.yaml` 中配置强密码
2. **限制访问**：使用 Hugging Face Spaces 的访问控制功能
3. **定期更新**：保持依赖包和基础镜像更新

## 📞 支持

如果遇到部署问题，请检查：
- [项目 README](README.md) 中的常见问题
- Hugging Face Spaces 的文档
- 项目的 Issues 页面