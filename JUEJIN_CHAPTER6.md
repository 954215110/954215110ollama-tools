# 第 6 章：部署与优化 - 让你的 Ollama Tools 上线

> 系列文章：
> - [第 1 章：Ollama 入门](https://juejin.cn/spost/7614644305726423075)
> - [第 2 章：API 详解](https://juejin.cn/spost/7614110147108716584)
> - [第 3 章：API 调用实战](https://juejin.cn/post/7614747451153727540)
> - [第 4 章：Web UI 开发](https://juejin.cn/post/7614451900677849103)
> - [第 5 章：高级功能开发](https://juejin.cn/post/7614708335367815183)
> - **第 6 章：部署与优化**（本文·最终章）

---

## 📖 前言

前 5 章我们完成了 Ollama Tools 的所有功能开发：
- ✅ 本地安装和 API 调用
- ✅ Web UI 聊天界面
- ✅ 语音、图片、统计等高级功能

但代码还在你本地运行！这一章我们来：
- 🚀 **Docker 容器化部署**
- 🔒 **HTTPS 安全配置**
- ⚡ **性能优化**
- 📊 **监控与日志**

**本章结束后，你的应用可以：**
- 在任何服务器上运行
- 通过 HTTPS 安全访问
- 7x24 小时稳定运行
- 性能优化，响应更快

---

## 🚀 方案 1：Docker 部署（推荐）

### 为什么用 Docker？

- ✅ 环境一致，避免"在我机器上能跑"
- ✅ 一键部署，无需手动安装依赖
- ✅ 易于扩展和维护
- ✅ 资源隔离，更安全

### 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 使用 Node.js 官方镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY src/ ./src/

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "src/server.js"]
```

### 创建 .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
*.md
uploads/
.env
```

### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  ollama-tools:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - OLLAMA_URL=http://host.docker.internal:11434
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    restart: unless-stopped
    networks:
      - ollama-network

  # 可选：一起部署 Ollama
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    restart: unless-stopped
    networks:
      - ollama-network

networks:
  ollama-network:
    driver: bridge

volumes:
  ollama-data:
```

### 构建和运行

```bash
# 构建镜像
docker build -t ollama-tools .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e OLLAMA_URL=http://host.docker.internal:11434 \
  -v $(pwd)/uploads:/app/uploads \
  --name ollama-tools \
  ollama-tools

# 或使用 docker-compose
docker-compose up -d
```

### 访问应用

- 本地访问：http://localhost:3000
- 服务器访问：http://你的IP:3000

---

## 🔒 方案 2：HTTPS 配置

### 为什么需要 HTTPS？

- 🔐 加密传输，保护用户数据
- ✅ 浏览器信任，无安全警告
- 📈 SEO 友好
- 🚀 HTTP/2 支持，更快

### 使用 Let's Encrypt 免费证书

#### 1. 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. 获取证书

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 3. 自动续期

Certbot 会自动设置定时任务，验证：

```bash
sudo certbot renew --dry-run
```

---

## 🔧 方案 3：Nginx 反向代理

### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 配置 Nginx

创建 `/etc/nginx/sites-available/ollama-tools`：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 支持（流式响应）
    location /api/chat-stream {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/ollama-tools /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## ⚡ 性能优化

### 1. 启用 Gzip 压缩

在 `server.js` 中添加：

```javascript
const compression = require('compression');
app.use(compression());
```

安装依赖：

```bash
npm install compression
```

### 2. 静态资源缓存

在 Nginx 配置中添加：

```nginx
location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 数据库优化

使用 SQLite 替代内存存储：

```javascript
const Database = require('better-sqlite3');
const db = new Database('data/ollama-tools.db');

// 创建索引
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_timestamp ON chat_history(timestamp);
  CREATE INDEX IF NOT EXISTS idx_model ON chat_history(model);
`);
```

### 4. 连接池优化

```javascript
// 限制并发连接
const express = require('express');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 每个 IP 最多 100 请求
});

app.use('/api/', limiter);
```

### 5. 图片优化

```javascript
const sharp = require('sharp');

// 压缩上传的图片
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const optimized = await sharp(req.file.path)
    .resize(1920, 1080, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  
  res.json({
    success: true,
    base64: optimized.toString('base64')
  });
});
```

---

## 📊 监控与日志

### 1. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start src/server.js --name ollama-tools

# 开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs ollama-tools

# 重启
pm2 restart ollama-tools

# 监控
pm2 monit
```

### 2. 添加健康检查

在 `server.js` 中添加：

```javascript
// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 定期检查 Ollama 连接
setInterval(async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(`${OLLAMA_URL}/api/tags`);
    console.log('✅ Ollama 连接正常');
  } catch (e) {
    console.error('❌ Ollama 连接失败:', e.message);
  }
}, 60000); // 每分钟检查
```

### 3. 日志记录

```javascript
const fs = require('fs');
const path = require('path');

// 创建日志目录
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const log = `${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms\n`;
    fs.appendFileSync(path.join(logDir, 'access.log'), log);
  });
  next();
});

// 错误日志
app.use((err, req, res, next) => {
  const log = `${new Date().toISOString()} ERROR ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(path.join(logDir, 'error.log'), log);
  res.status(500).json({ error: '服务器错误' });
});
```

---

## 📱 PWA 支持

### 创建 manifest.json

在 `src/webui/` 目录下创建 `manifest.json`：

```json
{
  "name": "Ollama Tools",
  "short_name": "Ollama",
  "description": "增强版 Ollama Web UI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#e94560",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 添加 Service Worker

在 `src/webui/sw.js` 中创建：

```javascript
const CACHE_NAME = 'ollama-tools-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### 在 HTML 中注册

在 `index.html` 的 `<head>` 中添加：

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#e94560">
<link rel="apple-touch-icon" href="/icon-192.png">

<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker 已注册'));
}
</script>
```

---

## 🚀 完整部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

set -e

echo "🚀 开始部署 Ollama Tools..."

# 1. 更新系统
echo "📦 更新系统..."
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
echo "📦 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装依赖
echo "📦 安装项目依赖..."
npm install --production

# 4. 安装 PM2
echo "📦 安装 PM2..."
sudo npm install -g pm2

# 5. 安装 Nginx
echo "📦 安装 Nginx..."
sudo apt install -y nginx

# 6. 配置 Nginx
echo "📝 配置 Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/ollama-tools
sudo ln -sf /etc/nginx/sites-available/ollama-tools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. 启动应用
echo "🚀 启动应用..."
pm2 start src/server.js --name ollama-tools
pm2 save
pm2 startup

# 8. 获取 SSL 证书
echo "🔒 配置 HTTPS..."
sudo certbot --nginx -d yourdomain.com --non-interactive --agree-tos --email your@email.com

echo "✅ 部署完成！"
echo "🌐 访问：https://yourdomain.com"
```

---

## 📝 部署检查清单

- [ ] Docker 镜像构建成功
- [ ] 容器正常运行
- [ ] HTTPS 证书配置
- [ ] Nginx 反向代理
- [ ] Gzip 压缩启用
- [ ] 静态资源缓存
- [ ] PM2 进程管理
- [ ] 日志记录正常
- [ ] 健康检查端点
- [ ] 监控告警配置
- [ ] 备份策略
- [ ] 灾难恢复计划

---

## 🎯 性能基准测试

### 使用 Apache Bench

```bash
# 安装
sudo apt install apache2-utils

# 测试
ab -n 1000 -c 10 http://localhost:3000/

# 输出示例
# Requests per second: 1234.56 [#/sec]
# Time per request: 0.810 [ms]
```

### 使用 wrk

```bash
# 安装
sudo apt install wrk

# 测试
wrk -t12 -c400 -d30s http://localhost:3000/
```

---

## 📊 本章小结

**我们完成了：**
- ✅ Docker 容器化部署
- ✅ HTTPS 安全配置
- ✅ Nginx 反向代理
- ✅ 性能优化（Gzip、缓存、数据库）
- ✅ 监控与日志（PM2、健康检查）
- ✅ PWA 支持

**学到的技能：**
- Docker 和 Docker Compose
- Let's Encrypt SSL 证书
- Nginx 配置
- 性能优化技巧
- 进程管理和监控

---

## 🎉 系列完结！

恭喜你完成了整个 Ollama Tools 系列教程！

**回顾整个系列：**
1. ✅ Ollama 入门
2. ✅ API 详解
3. ✅ API 调用实战
4. ✅ Web UI 开发
5. ✅ 高级功能开发
6. ✅ 部署与优化

**接下来你可以：**
- 🌟 给 GitHub 项目点 Star
- 📢 分享给需要的朋友
- 💬 在评论区反馈问题
- 🔧 贡献代码和想法

---

## 💖 感谢支持

如果这个系列对你有帮助：

1. ⭐ GitHub: （你的仓库链接）
2. 📢 分享给朋友
3. 💰 赞助支持（爱发电/微信/支付宝）

**你的支持是我持续创作的动力！**

---

**系列文章：**
- [第 1 章：Ollama 入门](https://juejin.cn/spost/7614644305726423075)
- [第 2 章：API 详解](https://juejin.cn/spost/7614110147108716584)
- [第 3 章：API 调用实战](https://juejin.cn/post/7614747451153727540)
- [第 4 章：Web UI 开发](https://juejin.cn/post/7614451900677849103)
- [第 5 章：高级功能开发](https://juejin.cn/post/7614708335367815183)
- **第 6 章：部署与优化**（本文·最终章）

**有问题？** 在评论区留言，我会尽快回复！

**完结撒花！🎉**
