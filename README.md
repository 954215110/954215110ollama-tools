# 🦙 Ollama Tools

> 增强版 Ollama Web UI - 让本地 AI 更好用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/954215110/ollama-tools)](https://github.com/954215110/ollama-tools/stargazers)
[![掘金教程](https://img.shields.io/badge/掘金 -6 章教程-blue)](https://juejin.cn/post/7614644305726423075)
[![知识星球](https://img.shields.io/badge/知识星球 - 加入-orange)](https://wx.zsxq.com/group/48885185811148)

**🎯 目标：500 Stars → 持续更新更多实用功能！**

**📢 配套 6 章完整教程：[从入门到部署](https://juejin.cn/post/7614644305726423075)**

**👉 如果你觉得这个项目有用，请点右上角 ⭐ Star 支持一下！你的支持是我持续更新的动力！**

---

## ✨ 功能特性

| 功能 | 说明 | 状态 |
|------|------|------|
| 📝 **15+ Prompt 模板** | 代码/文案/翻译/周报/简历/小红书等，一键调用 | ✅ |
| 💬 **对话历史** | 自动保存，支持搜索/导出 Markdown/PDF | ✅ |
| 🔄 **多模型对比** | 同时问多个模型，对比回答质量 | ✅ |
| 🎤 **语音输入/输出** | 说话提问，AI 语音回答 | ✅ |
| 🖼️ **图片理解** | 上传图片，多模态对话 | ✅ |
| 📊 **使用统计** | 对话数据可视化面板 | ✅ |
| 📤 **一键导出** | 对话内容导出为 Markdown 或 PDF | ✅ |
| 🎨 **简洁界面** | 轻量级 Web UI，开箱即用 | ✅ |
| 🌓 **主题切换** | 深色/浅色模式 | 🔄 计划中 |

---

## 🚀 快速开始

### 前置要求

- ✅ [Ollama](https://ollama.ai) 已安装并运行（本地 `http://localhost:11434`）
- ✅ Node.js 16+ 

**检查 Ollama 是否运行：**
```bash
ollama list
```

如果没有输出，先安装并启动 Ollama：
```bash
# 安装 Ollama
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# 下载安装包：https://ollama.ai/download

# 启动 Ollama
ollama serve

# 拉取模型（示例：Qwen2.5 7B）
ollama pull qwen2.5:7b
```

### 安装

```bash
# 1. 克隆项目
git clone https://github.com/954215110/ollama-tools.git
cd ollama-tools

# 2. 安装依赖
npm install

# 3. 启动服务
npm start

# 或使用 nodemon 自动重启
npm run dev
```

### 使用

**本地访问：** `http://localhost:3000`

**在线演示：** `https://12wc0wo892531.vicp.fun`（花生壳内网穿透）

---

## 📖 使用场景

### 💻 开发者
- ✅ 代码审查、Bug 调试、重构建议
- ✅ API 文档生成、技术写作
- ✅ 快速原型开发
- **常用模板：** 代码助手、数据分析

### ✍️ 内容创作者
- ✅ 小红书/公众号/知乎文案
- ✅ 视频脚本、标题优化
- ✅ 多平台内容适配
- **常用模板：** 文案写作、小红书文案、短视频脚本

### 📊 职场人士
- ✅ 周报/月报自动生成
- ✅ 邮件润色、PPT 大纲
- ✅ 数据分析、Excel 公式
- **常用模板：** 周报生成、邮件写作、润色改写

### 🌍 学习者
- ✅ 外语翻译、语法纠正
- ✅ 概念解释、学习规划
- ✅ 面试准备、简历优化
- **常用模板：** 翻译助手、学习导师、简历优化、面试模拟

---

## 📸 界面预览

### 聊天界面
![聊天界面](https://via.placeholder.com/800x450.png?text=Ollama+Tools+Chat+UI)
*简洁易用的聊天界面，支持流式响应*

### 多模型对比
![多模型对比](https://via.placeholder.com/800x450.png?text=Multi-Model+Comparison)
*同时对比多个模型的回答质量*

### Prompt 模板
![Prompt 模板](https://via.placeholder.com/800x450.png?text=Prompt+Templates)
*15+ 实用模板，一键调用*

> 💡 **提示：** 实际界面更美观，这是占位图。欢迎 Star 后亲自体验！

---

## ❓ 为什么选择 Ollama Tools？

| 对比项 | Ollama 官方 CLI | Ollama WebUI | Ollama Tools |
|--------|---------------|--------------|--------------|
| 界面类型 | 命令行 | Web UI | Web UI |
| Prompt 模板 | ❌ 无 | ⚠️ 少量 | ✅ 15+ 内置 |
| 对话历史 | ⚠️ 基础 | ✅ 有 | ✅ 搜索 + 导出 |
| 多模型对比 | ❌ 无 | ❌ 无 | ✅ 支持 |
| 语音功能 | ❌ 无 | ⚠️ 部分 | ✅ 输入 + 输出 |
| 图片理解 | ❌ 无 | ✅ 有 | ✅ 有 |
| 导出格式 | ❌ 无 | ⚠️ 有限 | ✅ Markdown/PDF |
| 部署难度 | 简单 | 中等 | 简单 |
| 资源占用 | 低 | 中 | 低 |

---

## 🛠️ 配置

### 方式 1：环境变量（推荐）

```bash
# 设置端口
export PORT=3000

# 设置 Ollama 服务地址（默认 http://localhost:11434）
export OLLAMA_URL=http://localhost:11434

# 启动
npm start
```

### 方式 2：修改代码

编辑 `src/server.js`：

```javascript
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
```

### 方式 3：Docker 部署

```bash
# 构建镜像
docker build -t ollama-tools .

# 运行容器
docker run -d -p 3000:3000 \
  -e OLLAMA_URL=http://host.docker.internal:11434 \
  ollama-tools
```

---

## 📚 配套教程

**6 章完整教程，从入门到部署：**

| 章节 | 标题 | 链接 |
|------|------|------|
| 第 1 章 | Ollama 入门 | [阅读](https://juejin.cn/spost/7614644305726423075) |
| 第 2 章 | API 详解 | [阅读](https://juejin.cn/spost/7614110147108716584) |
| 第 3 章 | API 调用实战 | [阅读](https://juejin.cn/post/7614747451153727540) |
| 第 4 章 | Web UI 开发 | [阅读](https://juejin.cn/post/7614451900677849103) |
| 第 5 章 | 高级功能开发 | [阅读](https://juejin.cn/post/7614708335367815183) |
| 第 6 章 | 部署与优化 | [阅读](https://juejin.cn/post/7614884374551756835) |

---

## 🎁 额外资源

### Prompt 模板包

**15 个实用 Prompt 模板**（代码/文案/翻译/学习/数据分析等）

- 📄 [查看模板详情](./PROMPT_TEMPLATES.md)
- 💰 单独购买：¥19（爱发电/面包多审核中）
- 🎁 **免费获取：** 加入知识星球即送

### 知识星球

**Ollama Tools 实战圈**

- ✅ 完整源码下载
- ✅ 一对一部署答疑
- ✅ 最新 AI 工具分享
- ✅ 同行交流 + 内推机会
- ✅ Prompt 模板包免费赠送

👉 **加入链接：** https://wx.zsxq.com/group/48885185811148

**年费：¥199**（早鸟价）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献方式

1. 🐛 报告 Bug
2. 💡 提出新功能建议
3. 📝 改进文档
4. 🎨 优化 UI/UX
5. 🌍 翻译多语言

### 开发流程

```bash
# 1. Fork 本项目
# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 提交变更
git commit -m "Add your feature"

# 4. 推送到分支
git push origin feature/your-feature

# 5. 创建 Pull Request
```

---

## ❓ FAQ

### Q1: 无法连接 Ollama 服务？

**A:** 确保 Ollama 正在运行：
```bash
ollama serve
```

如果还是不行，检查端口是否正确（默认 11434）。

---

### Q2: 支持哪些模型？

**A:** 支持所有 Ollama 提供的模型：
- Llama 3.2 (1B/3B)
- Qwen2.5 (7B/14B/72B)
- DeepSeek-V2.5
- Mistral
- Gemma
- 等等...

使用 `ollama list` 查看已安装的模型。

---

### Q3: 如何外网访问？

**A:** 有三种方式：

1. **内网穿透（推荐）：**
   ```bash
   # 使用花生壳/ngrok
   # 示例：https://your-domain.vicp.fun
   ```

2. **云服务器部署：**
   ```bash
   # 部署到阿里云/腾讯云
   # 配置 Nginx 反向代理
   ```

3. **Docker 部署：**
   ```bash
   docker run -p 80:3000 ollama-tools
   ```

详细教程见 [第 6 章：部署与优化](https://juejin.cn/post/7614884374551756835)

---

### Q4: 对话历史存储在哪里？

**A:** 默认存储在内存中，重启服务会清空。

**生产环境建议：**
- 使用 MongoDB/MySQL 持久化
- 或集成 Redis 缓存

欢迎贡献持久化功能！🙌

---

### Q5: 可以商用吗？

**A:** 可以！本项目采用 MIT 协议，允许商用。

但请遵守：
1. 保留原作者信息
2. 如有改进，欢迎回馈社区

---

## 💖 Sponsor

如果这个项目对你有帮助，请考虑赞助支持开发 ❤️

### 🇨🇳 国内用户

| 平台 | 链接 | 说明 |
|------|------|------|
| **知识星球** | [加入](https://wx.zsxq.com/group/48885185811148) | ¥199/年，源码 + 答疑 |
| **爱发电** | [afdian.net/@谢轩](https://afdian.net/@谢轩) | 认证中 |
| **面包多** | 审核中 | 源码包 ¥99 |
| **微信/支付宝** | [查看收款码](./.github/SPONSORS.md) | 随意赞赏 |

### 🌍 海外用户

| 平台 | 链接 |
|------|------|
| **GitHub Sponsors** | [赞助我](https://github.com/sponsors/954215110) |
| **Buy Me a Coffee** | [请我喝咖啡](https://www.buymeacoffee.com/954215110) |

### 🏆 赞助者名单

感谢所有赞助本项目的朋友！

| 赞助者 | 金额 | 日期 |
|--------|------|------|
| *(你的名字)* | - | - |

**赞助后请邮件告知 (954215110@qq.com)，我会把你加入名单！**

---

## 📊 项目统计

![GitHub Stats](https://repobeats.axiom.co/api/embed/your-repo-id.svg)

*Star 历史趋势*

---

## 📄 License

MIT License © 2026 [954215110](https://github.com/954215110)

---

## 📬 联系方式

- 📧 Email: 954215110@qq.com
- 📱 微信：x7123138
- 💬 知识星球：[加入圈子](https://wx.zsxq.com/group/48885185811148)

---

## 🎯 Roadmap

### ✅ 已完成
- [x] Web 聊天界面
- [x] Prompt 模板（15 个）
- [x] 对话历史管理
- [x] 多模型对比
- [x] 语音输入/输出
- [x] 图片理解
- [x] 使用统计
- [x] 6 章配套教程

### 🔄 计划中
- [ ] 深色/浅色主题切换
- [ ] 对话搜索功能
- [ ] 快捷命令（/help, /clear）
- [ ] 移动端优化
- [ ] 对话历史持久化（数据库）
- [ ] 更多 Prompt 模板（30+）
- [ ] 多语言支持（i18n）

### 💡 欢迎提议
如果你有好的想法，欢迎提 Issue！

---

**Made with ❤️ by [954215110](https://github.com/954215110)**

**最后更新：** 2026-03-09
