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

# 启动服务
echo "启动 WebAI2API 服务..."
echo "注意：浏览器初始化可能需要 30-60 秒"
echo ""

# 使用 supervisor 启动（带虚拟显示器）
exec node supervisor.js -xvfb -vnc -port $PORT
