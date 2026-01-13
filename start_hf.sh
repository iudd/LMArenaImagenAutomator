#!/bin/bash

# Hugging Face Space 启动脚本

# 设置环境变量
export PORT=${PORT:-7860}
export HF_SPACE=1

echo "=========================================="
echo "WebAI2API - Hugging Face Space 启动脚本"
echo "=========================================="
echo "端口: $PORT"
echo "工作目录: $(pwd)"
echo "=========================================="

# 创建数据目录
mkdir -p data

# 使用配置文件
if [ -f "config.hf.yaml" ]; then
    echo "使用 Hugging Face 配置文件"
    cp config.hf.yaml data/config.yaml
    sed -i "s/port: 7860/port: $PORT/g" data/config.yaml
elif [ -f "data/config.yaml" ]; then
    echo "使用现有配置文件"
    sed -i "s/port: 3000/port: $PORT/g" data/config.yaml
else
    echo "从示例配置文件创建"
    cp config.example.yaml data/config.yaml
    sed -i "s/port: 3000/port: $PORT/g" data/config.yaml
fi

# 显示当前配置
echo ""
echo "配置文件预览："
echo "----------------------------------------"
grep -E "^(port|headless|fission|queueBuffer|imageLimit):" data/config.yaml
echo "----------------------------------------"
echo ""

# 自动恢复数据
if [ -n "$HF_DATASET_REPO" ] && [ -n "$HF_TOKEN" ]; then
    echo "=========================================="
    echo "📦 自动恢复浏览器数据..."
    echo "=========================================="
    
    if [ -d "data/camoufoxUserData" ]; then
        echo "⚠️  本地已有数据，跳过恢复"
        echo "如需强制恢复，请先运行：npm run clear-data"
    else
        echo "正在从 Dataset 恢复数据..."
        if npm run restore-data; then
            echo "✅ 数据恢复成功"
        else
            echo "⚠️  数据恢复失败，将使用新的浏览器实例"
        fi
    fi
    echo ""
else
    echo "=========================================="
    echo "⚠️  未配置数据持久化"
    echo "=========================================="
    echo "如需保存浏览器登录状态，请配置以下环境变量："
    echo "  - HF_DATASET_REPO: Dataset 仓库（如：iudd/webai2api-data）"
    echo "  - HF_TOKEN: Hugging Face Token（需要 write 权限）"
    echo ""
    echo "配置后，登录完成后运行：npm run save-data"
    echo ""
fi

# 启动服务
echo "=========================================="
echo "🚀 启动 WebAI2API 服务..."
echo "=========================================="
echo "注意：浏览器初始化可能需要 30-60 秒"
echo ""

# 使用 supervisor 启动（带虚拟显示器）
exec node supervisor.js -xvfb -vnc -port $PORT
