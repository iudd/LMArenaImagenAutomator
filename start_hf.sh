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

# 使用优化版配置文件
if [ -f "config.hf.yaml" ]; then
    echo "使用 Hugging Face 优化配置文件"
    cp config.hf.yaml data/config.yaml
    sed -i "s/port: 7860/port: $PORT/g" data/config.yaml
else
    echo "使用默认配置文件"
    if [ -f "data/config.yaml" ]; then
        sed -i "s/port: 3000/port: $PORT/g" data/config.yaml
    else
        # 如果配置文件不存在，从示例复制
        cp config.example.yaml data/config.yaml
        sed -i "s/port: 3000/port: $PORT/g" data/config.yaml
        # 应用优化设置
        sed -i "s/headless: false/headless: true/g" data/config.yaml
        sed -i "s/fission: true/fission: false/g" data/config.yaml
        sed -i "s/queueBuffer: 2/queueBuffer: 1/g" data/config.yaml
        sed -i "s/imageLimit: 5/imageLimit: 3/g" data/config.yaml
    fi
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
