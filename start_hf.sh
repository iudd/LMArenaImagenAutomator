#!/bin/bash

# Hugging Face Space 启动脚本

# 设置环境变量
export PORT=${PORT:-7860}
export HF_SPACE=1

# 修改配置文件中的端口
if [ -f "data/config.yaml" ]; then
    sed -i "s/port: 3000/port: $PORT/g" data/config.yaml
else
    # 如果配置文件不存在，从示例复制
    cp config.example.yaml data/config.yaml
    sed -i "s/port: 3000/port: $PORT/g" data/config.yaml
fi

# 启动服务
echo "Starting WebAI2API on port $PORT"
node supervisor.js -xvfb -vnc -port $PORT
