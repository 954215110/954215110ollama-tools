# 🌐 本地部署 SaaS 指南

> 零成本部署，用现有电脑 + 内网穿透

---

## 📋 方案对比

| 工具 | 免费额度 | 速度 | 稳定性 | 推荐 |
|------|---------|------|--------|------|
| **ngrok** | 50GB/月 | 中 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cloudflare Tunnel** | 无限 | 快 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **frp** | 自有服务器 | 快 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **花生壳** | 1GB/月 | 慢 | ⭐⭐ | ⭐⭐ |

**推荐：Cloudflare Tunnel（免费 + 稳定 + 快速）**

---

## 🚀 方案 A：Cloudflare Tunnel（推荐）

### 前提条件
- 有 Cloudflare 账号（免费）
- 有一个域名（可选，没有也可以用临时域名）

### 步骤 1：安装 cloudflared

```powershell
# Windows (Chocolatey)
choco install cloudflared

# 或手动下载
# https://github.com/cloudflare/cloudflared/releases
```

### 步骤 2：启动服务

```powershell
cd C:\Users\86158\.openclaw\workspace\ollama-tools
npm start
```

### 步骤 3：启动 Tunnel

```powershell
# 临时域名（无需配置）
cloudflared tunnel --url http://localhost:3000

# 或绑定自己的域名
cloudflared tunnel run <tunnel-name>
```

### 步骤 4：获取公网地址

启动后会显示：
```
https://xxxx-xxxx-xxxx.trycloudflare.com
```

把这个链接发给别人就能访问了！

---

## 🚀 方案 B：ngrok

### 步骤 1：注册 ngrok

https://ngrok.com

### 步骤 2：下载并安装

```powershell
# Windows (Chocolatey)
choco install ngrok

# 或手动下载
# https://ngrok.com/download
```

### 步骤 3：认证

```powershell
ngrok config add-authtoken <你的 token>
```

### 步骤 4：启动

```powershell
ngrok http 3000
```

### 步骤 5：获取地址

显示：
```
https://xxxx.ngrok.io
```

---

## 🚀 方案 C：本地直接访问（仅局域网）

### 步骤 1：查看本机 IP

```powershell
ipconfig
```

找到 IPv4 地址，例如：`192.168.1.100`

### 步骤 2：同一局域网内访问

别人可以用：
```
http://192.168.1.100:3000
```

**限制：** 只能局域网访问，外网不行

---

## 📦 Docker 部署（可选）

### 构建镜像

```powershell
docker build -t ollama-tools .
```

### 运行容器

```powershell
docker run -d -p 3000:3000 --name ollama-tools ollama-tools
```

### 内网穿透

同样用 cloudflared 或 ngrok

---

## ⚠️ 注意事项

### 1. Ollama 也要本地运行

确保 Ollama 在运行：
```powershell
ollama serve
```

### 2. 防火墙设置

允许 3000 端口：
```powershell
netsh advfirewall firewall add rule name="Ollama Tools" dir=in action=allow protocol=TCP localport=3000
```

### 3. 电脑不能休眠

设置电源选项，防止电脑休眠

### 4. 带宽限制

家用上行带宽通常 20-50Mbps，支持 10-20 人同时访问

---

## 💰 成本对比

| 方案 | 月成本 | 适合 |
|------|--------|------|
| 本地 + Cloudflare | ¥0 | 测试/演示 |
| 本地 + ngrok | ¥0-100 | 小流量 |
| 阿里云 ECS | ¥200+ | 正式运营 |
| 阿里云 FC | ¥50-200 | 中等流量 |

---

## 🎯 推荐路线

```
1. 本地 + Cloudflare（测试，¥0）
   ↓ 有用户了
2. 阿里云 FC（按量，¥50-200）
   ↓ 流量大了
3. 阿里云 ECS（包月，¥200+）
```

---

## 📬 快速开始

**现在就试试：**

```powershell
# 1. 启动服务
cd C:\Users\86158\.openclaw\workspace\ollama-tools
npm start

# 2. 启动 Cloudflare Tunnel（新窗口）
cloudflared tunnel --url http://localhost:3000

# 3. 复制显示的 https 链接，发给别人测试
```

---

**搞定！零成本部署 SaaS！** 🎉
