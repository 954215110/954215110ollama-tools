# ☁️ 云服务器推荐 - 部署 Ollama 必备

## 为什么需要云服务器？

如果你想让 Ollama Tools **24 小时在线**，或者**分享给团队使用**，需要一台云服务器。

本地部署适合个人学习，但云服务器有以下优势：

| 对比项 | 本地部署 | 云服务器 |
|--------|----------|----------|
| 在线时长 | 关机就停 | 24 小时在线 |
| 访问范围 | 仅本机 |  anywhere |
| 性能 | 受限于你的电脑 | 可选高配 GPU |
| 成本 | 免费 | ¥50-500/月 |

---

## 🎁 阿里云优惠推荐

**推荐配置（跑 Ollama 7B 模型）：**

| 配置 | 价格 | 适用场景 |
|------|------|----------|
| 2 核 4G | ¥89/年 | 学习测试 |
| 4 核 8G | ¥299/年 | 个人使用 |
| 8 核 16G + GPU | ¥999/月起 | 生产环境/团队 |

**👉 领取优惠：** [阿里云云服务器特惠](https://www.aliyun.com/minisite/goods?userCode=2g9nf6lu)

> 💡 **提示：** 通过上方链接购买，你我都能获得额外优惠！

---

## 📖 部署教程

### 方式 1：Docker 一键部署（推荐）

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com | bash

# 2. 启动 Ollama
docker run -d -p 11434:11434 ollama/ollama

# 3. 拉取模型
docker exec -it ollama ollama pull qwen2.5:7b

# 4. 部署 Ollama Tools
git clone https://github.com/954215110/ollama-tools.git
cd ollama-tools
npm install
npm start

# 5. 开放端口（阿里云安全组）
# 放行 3000 端口
```

### 方式 2：源码部署

```bash
# 1. 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 2. 安装 Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 3. 启动 Ollama
ollama serve &

# 4. 部署 Ollama Tools
git clone https://github.com/954215110/ollama-tools.git
cd ollama-tools
npm install
npm start
```

---

## 🔧 阿里云安全组配置

**必须开放的端口：**

| 端口 | 用途 | 协议 |
|------|------|------|
| 22 | SSH 连接 | TCP |
| 3000 | Ollama Tools | TCP |
| 11434 | Ollama 服务 | TCP |

**配置步骤：**
1. 登录阿里云控制台
2. 进入"云服务器 ECS" → "安全组"
3. 添加规则，放行上述端口

---

## 💰 省钱技巧

1. **选择年付** - 比月付便宜 30-50%
2. **新用户优惠** - 首年低至 ¥89
3. **学生机** - 如果有学生认证，更便宜
4. **活动节点** - 双 11/618 等大促时囤货

**👉 查看最新活动：** [阿里云特惠专区](https://www.aliyun.com/minisite/goods?userCode=2g9nf6lu)

---

## ❓ 常见问题

### Q: 云服务器跑不动大模型？

**A:** 7B 以下模型 4G 内存够用，72B 需要 32G+ 内存或 GPU。

推荐配置：
- Qwen2.5-7B: 4 核 8G
- Qwen2.5-14B: 8 核 16G
- Qwen2.5-72B: 16 核 32G + GPU

### Q: 部署后无法访问？

**A:** 检查两点：
1. 安全组端口是否开放
2. 防火墙是否允许

```bash
# 关闭防火墙（测试用）
systemctl stop firewalld

# 或添加规则
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload
```

### Q: 如何绑定域名？

**A:** 
1. 购买域名（阿里云 ¥9/年）
2. 添加 A 记录指向服务器 IP
3. 配置 Nginx 反向代理

详细教程见 [第 6 章：部署与优化](https://juejin.cn/post/7614884374551756835)

---

## 🎯 下一步

- 📖 阅读 [第 6 章：部署与优化](https://juejin.cn/post/7614884374551756835)
- 💬 遇到问题？加入 [知识星球](https://wx.zsxq.com/group/48885185811148) 提问
- 🎁 需要帮助部署？[预约技术咨询](mailto:954215110@qq.com)

---

**通过推荐链接购买，支持项目持续开发！❤️**
