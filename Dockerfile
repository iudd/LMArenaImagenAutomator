FROM node:22-bookworm

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV PORT=7860
ENV HF_SPACE=1

# 1. 安装系统依赖
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxss1 \
    libxtst6 \
    libgbm1 \
    libdbus-glib-1-2 \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. 复制依赖文件、脚本和补丁目录，然后安装
COPY package.json pnpm-lock.yaml ./  
COPY scripts/ ./scripts/
COPY patches/ ./patches/
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 3. 复制源码并初始化
COPY . .
RUN npm run init

# 4. 复制并设置 Hugging Face Space 启动脚本
COPY start_hf.sh /app/start_hf.sh
RUN chmod +x /app/start_hf.sh

# 暴露 Hugging Face Space 期望的端口
EXPOSE 7860 5900

# 5. 使用 Hugging Face Space 启动脚本
CMD ["/app/start_hf.sh"]
