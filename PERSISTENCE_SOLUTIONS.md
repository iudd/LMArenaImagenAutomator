# Hugging Face Space 数据持久化方案

## 📋 问题

Hugging Face Space 的存储不是持久化的，每次重启后：
- `data/` 目录会被清空
- 浏览器登录状态会丢失
- 需要重新登录

## 🎯 需求

1. **首次启动**：登录模式，保存登录信息
2. **再次启动**：正常模式，使用保存的登录信息

## 💡 解决方案

### 方案一：使用 Hugging Face Datasets（推荐）

**优点**：
- ✅ 免费
- ✅ 完全集成在 Hugging Face 生态中
- ✅ 支持大文件
- ✅ 自动版本控制

**缺点**：
- ❌ 需要额外的 API Token
- ❌ 上传/下载需要时间

**实现步骤**：

1. **创建 Dataset**：
   - 访问 https://huggingface.co/datasets
   - 创建新的 Dataset（如 `YOUR_USERNAME/webai2api-data`）
   - 设置为 Private（保护隐私）

2. **配置环境变量**：
   在 Space Settings 中添加：
   - `HF_DATASET_REPO`: `YOUR_USERNAME/webai2api-data`
   - `HF_TOKEN`: 您的 Hugging Face Token（需要 write 权限）

3. **自动保存脚本**：
   ```bash
   # 登录完成后，手动执行
   npm run save-data
   ```

4. **启动时自动恢复**：
   启动脚本会自动检查并恢复数据

---

### 方案二：使用外部云存储（S3/OneDrive）

**优点**：
- ✅ 灵活性高
- ✅ 可以使用任何云服务
- ✅ 成本可控

**缺点**：
- ❌ 需要额外的云服务账号
- ❌ 需要配置 API 密钥

**支持的云服务**：
- AWS S3
- 阿里云 OSS
- 腾讯云 COS
- OneDrive
- Google Drive

---

### 方案三：使用 Cookie 导出/导入（轻量级）

**优点**：
- ✅ 文件小，上传快
- ✅ 只保存必要信息
- ✅ 安全性高

**缺点**：
- ❌ 可能需要重新登录（Cookie 过期）
- ❌ 功能有限

**实现**：
```bash
# 导出 Cookie
npm run export-cookies

# 导入 Cookie
npm run import-cookies
```

---

### 方案四：使用 Hugging Face Space 持久化存储（付费）

**优点**：
- ✅ 最简单
- ✅ 自动持久化
- ✅ 无需额外配置

**缺点**：
- ❌ 需要付费（$5/月 起）
- ❌ 需要升级 Space

**步骤**：
1. 在 Space Settings 中启用持久化存储
2. 选择存储大小（10GB 起）
3. 每月 $5

---

## 🚀 推荐方案对比

| 方案 | 成本 | 复杂度 | 可靠性 | 推荐度 |
|------|------|--------|--------|--------|
| Datasets | 免费 | 中 | 高 | ✅✅✅ |
| 外部云存储 | 低 | 高 | 高 | ✅✅ |
| Cookie 导出 | 免费 | 低 | 中 | ✅ |
| 持久化存储 | $5/月 | 低 | 最高 | ✅✅✅✅ |

## 📖 详细实现

### 方案一：使用 Hugging Face Datasets（完整实现）

#### 1. 创建 Dataset

1. 访问 https://huggingface.co/datasets/new
2. 输入名称：`YOUR_USERNAME/webai2api-data`
3. 选择：Private
4. 点击 Create

#### 2. 获取 Token

1. 访问 https://huggingface.co/settings/tokens
2. 创建新 Token
3. 权限选择：`write`
4. 复制 Token

#### 3. 配置 Space

在 Space Settings → Variables 中添加：
```
HF_DATASET_REPO=YOUR_USERNAME/webai2api-data
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 4. 使用脚本

项目已包含以下脚本：

**保存数据**：
```bash
# 登录完成后执行
npm run save-data
```

**恢复数据**：
```bash
# 启动时自动执行
# 或手动执行
npm run restore-data
```

**删除数据**：
```bash
npm run clear-data
```

#### 5. 工作流程

**首次使用**：
1. 启动 Space（无数据）
2. 通过 WebUI 登录
3. 执行 `npm run save-data` 保存数据
4. 数据上传到 Hugging Face Dataset

**后续使用**：
1. 启动 Space
2. 自动从 Dataset 恢复数据
3. 直接使用，无需重新登录

---

## 🔧 故障排除

### 问题 1：上传失败

**原因**：Token 权限不足

**解决**：
1. 检查 Token 是否有 `write` 权限
2. 检查 Dataset 名称是否正确
3. 检查网络连接

### 问题 2：恢复失败

**原因**：数据损坏或不完整

**解决**：
1. 删除本地数据：`npm run clear-data`
2. 重新上传：`npm run save-data`
3. 检查 Dataset 中的文件

### 问题 3：Cookie 过期

**原因**：Cookie 有效期已过

**解决**：
1. 重新登录
2. 重新保存数据

---

## 💰 成本估算

### 方案一：Hugging Face Datasets
- **存储**：免费（有限制）
- **流量**：免费
- **总计**：$0/月

### 方案二：外部云存储
- **AWS S3**: $0.023/GB/月
- **阿里云 OSS**: ¥0.12/GB/月
- **腾讯云 COS**: ¥0.118/GB/月

### 方案三：Cookie 导出
- **存储**：免费（文件很小）
- **总计**：$0/月

### 方案四：持久化存储
- **10GB**: $5/月
- **20GB**: $10/月
- **50GB**: $20/月

---

## 📝 总结

**推荐方案**：
- **测试/个人使用**：方案一（Hugging Face Datasets）
- **生产环境**：方案四（持久化存储）
- **成本敏感**：方案三（Cookie 导出）

**注意事项**：
- ⚠️ 定期备份数据
- ⚠️ 不要将敏感信息提交到公开仓库
- ⚠️ 使用 HTTPS 保护数据传输
