# 第 4 章：Web UI 开发 - 给 Ollama 做个可视化界面

> 系列文章：
> - [第 1 章：Ollama 入门](https://juejin.cn/spost/7614644305726423075)
> - [第 2 章：API 详解](https://juejin.cn/spost/7614110147108716584)
> - [第 3 章：API 调用实战](https://juejin.cn/post/7614747451153727540)
> - **第 4 章：Web UI 开发**（本文）

---

## 📖 前言

如果你已经跟着前 3 章走完了，现在你应该可以：
- ✅ 在本地运行 Ollama
- ✅ 理解 Ollama API 的结构
- ✅ 用 Python/Node.js 调用 API

但每次都要写代码调用 API 太麻烦了！这一章我们来做一个**完整的 Web UI**，让你可以在浏览器里直接和 Ollama 聊天。

**本章成果：**
- 🎨 一个漂亮的 Web 聊天界面
- 🔄 多模型对比功能
- 📜 对话历史记录
- 📥 导出 Markdown/PDF
- 💡 15 个实用 Prompt 模板

**在线演示：** （部署后补充链接）

---

## 🏗️ 项目结构

先创建项目目录：

```bash
mkdir ollama-tools
cd ollama-tools
npm init -y
npm install express cors node-fetch
```

项目结构：

```
ollama-tools/
├── src/
│   ├── server.js        # Express 后端
│   └── webui/
│       └── index.html   # 前端页面
├── package.json
└── .env                 # 环境变量（可选）
```

---

## 🔧 后端开发（server.js）

创建 `src/server.js`：

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'webui')));

// 对话历史存储（内存，生产环境可用数据库）
let chatHistory = [];

// 获取 Ollama 模型列表
app.get('/api/models', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '无法连接 Ollama 服务' });
  }
});

// 发送聊天请求
app.post('/api/chat', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const { model, messages, stream = false } = req.body;
    
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream })
    });
    
    const data = await response.json();
    
    // 保存到历史记录
    chatHistory.push({
      timestamp: new Date().toISOString(),
      model,
      messages,
      response: data.message
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取对话历史
app.get('/api/history', (req, res) => {
  res.json(chatHistory.slice(-50)); // 返回最近 50 条
});

// 清空历史
app.delete('/api/history', (req, res) => {
  chatHistory = [];
  res.json({ success: true });
});

// 多模型对比
app.post('/api/compare', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const { models, prompt } = req.body;
    
    const results = await Promise.all(
      models.map(async (model) => {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, prompt, stream: false })
        });
        const data = await response.json();
        return { model, response: data.response };
      })
    );
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prompt 模板
const promptTemplates = [
  { id: 1, name: '💻 代码助手', prompt: '你是一个专业的程序员，请帮我解决以下编程问题：' },
  { id: 2, name: '✍️ 文案写作', prompt: '你是一个专业的文案策划，请帮我写以下内容：' },
  { id: 3, name: '🌐 翻译助手', prompt: '请将以下内容翻译成中文，保持原意和语气：' },
  { id: 4, name: '📚 学习导师', prompt: '你是一个耐心的老师，请用简单易懂的方式解释：' },
  { id: 5, name: '📊 数据分析', prompt: '请分析以下数据，给出洞察和建议：' },
  { id: 6, name: '📝 润色改写', prompt: '请润色以下文本，使其更流畅专业：' },
  { id: 7, name: '🎯 周报生成', prompt: '请根据以下工作内容，帮我生成一份简洁专业的周报：' },
  { id: 8, name: '💡 头脑风暴', prompt: '我需要关于以下主题的创意和想法，请帮我头脑风暴：' },
  { id: 9, name: '📧 邮件写作', prompt: '请帮我写一封专业的邮件，内容是：' },
  { id: 10, name: '🔍 简历优化', prompt: '请帮我优化以下简历内容，使其更具吸引力：' },
  { id: 11, name: '📱 小红书文案', prompt: '请帮我写一篇小红书风格的文案，主题是：' },
  { id: 12, name: '🎬 短视频脚本', prompt: '请帮我写一个短视频脚本，主题是：' },
  { id: 13, name: '📖 读书总结', prompt: '请帮我总结以下书籍/文章的核心观点：' },
  { id: 14, name: '🍳 菜谱推荐', prompt: '我有以下食材，请推荐可以做的菜和做法：' },
  { id: 15, name: '💼 面试模拟', prompt: '你是一个面试官，请针对以下岗位对我进行模拟面试：' }
];

app.get('/api/prompts', (req, res) => {
  res.json(promptTemplates);
});

// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'webui', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🦙 Ollama Tools 已启动：http://localhost:${PORT}`);
  console.log(`📡 Ollama 服务地址：${OLLAMA_URL}`);
});
```

**核心功能说明：**

| API 端点 | 方法 | 功能 |
|---------|------|------|
| `/api/models` | GET | 获取 Ollama 模型列表 |
| `/api/chat` | POST | 发送聊天请求 |
| `/api/history` | GET | 获取对话历史 |
| `/api/history` | DELETE | 清空历史记录 |
| `/api/compare` | POST | 多模型对比 |
| `/api/prompts` | GET | 获取 Prompt 模板 |

---

## 🎨 前端开发（index.html）

创建 `src/webui/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🦙 Ollama Tools</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; font-size: 16px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { text-align: center; padding: 30px 0; border-bottom: 1px solid #333; margin-bottom: 30px; }
    h1 { font-size: 3em; margin-bottom: 10px; }
    .tagline { color: #888; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #16213e; border-radius: 12px; padding: 20px; }
    .card h2 { margin-bottom: 15px; font-size: 1.5em; }
    textarea { width: 100%; min-height: 150px; padding: 15px; border: 1px solid #333; border-radius: 8px; background: #0f0f23; color: #eee; font-size: 16px; resize: vertical; }
    select { width: 100%; padding: 10px; border: 1px solid #333; border-radius: 8px; background: #0f0f23; color: #eee; margin-bottom: 15px; }
    button { background: #e94560; color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 5px; transition: all 0.3s; }
    button:hover { background: #ff6b6b; transform: translateY(-2px); }
    button.secondary { background: #444; }
    button.secondary:hover { background: #555; }
    .response { background: #0f0f23; border-radius: 8px; padding: 15px; margin-top: 15px; min-height: 100px; white-space: pre-wrap; line-height: 1.6; }
    .templates { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
    .template-btn { background: #0f3460; padding: 8px 16px; font-size: 13px; }
    .template-btn:hover { background: #1a4a7a; }
    .history { max-height: 300px; overflow-y: auto; }
    .history-item { background: #0f0f23; border-radius: 8px; padding: 12px; margin-bottom: 10px; font-size: 15px; }
    .history-item .meta { color: #666; font-size: 12px; margin-bottom: 5px; }
    .sponsor { text-align: center; padding: 30px; background: linear-gradient(135deg, #e94560, #ff6b6b); border-radius: 12px; margin-top: 30px; }
    .sponsor a { color: white; text-decoration: underline; }
    .loading { color: #888; font-style: italic; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🦙 Ollama Tools</h1>
      <p class="tagline">增强版 Ollama Web UI - 让本地 AI 更好用</p>
    </header>

    <div class="grid">
      <div class="card">
        <h2>💬 聊天</h2>
        <select id="modelSelect"><option>加载中...</option></select>
        <div class="templates" id="templates"></div>
        <textarea id="prompt" placeholder="输入你的问题..."></textarea>
        <div style="margin-top: 15px;">
          <button onclick="send()">发送</button>
          <button class="secondary" onclick="clearPrompt()">清空</button>
        </div>
        <div id="response" class="response">等待输入...</div>
      </div>

      <div class="card">
        <h2>🔄 多模型对比</h2>
        <div id="modelCheckboxes" style="margin-bottom: 15px;"></div>
        <textarea id="comparePrompt" placeholder="输入要对比的问题..."></textarea>
        <div style="margin-top: 15px;">
          <button onclick="compare()">开始对比</button>
        </div>
        <div id="compareResponse" class="response">等待输入...</div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2>📜 对话历史</h2>
      <div id="history" class="history">加载中...</div>
      <div style="margin-top: 15px;">
        <button class="secondary" onclick="loadHistory()">刷新</button>
        <button class="secondary" onclick="clearHistory()">清空历史</button>
        <button class="secondary" onclick="exportHistory('md')">导出 Markdown</button>
        <button class="secondary" onclick="exportHistory('pdf')">导出 PDF</button>
      </div>
    </div>

    <div class="sponsor">
      <h2>💖 喜欢这个项目？</h2>
      <p style="margin: 15px 0;">如果 Ollama Tools 对你有帮助，请考虑 <a href="#">赞助支持</a> 开发！</p>
      <p>你的支持是我持续更新的动力 ❤️</p>
    </div>
  </div>

  <script>
    let models = [];

    // 加载模型列表
    async function loadModels() {
      try {
        const res = await fetch('/api/models');
        const data = await res.json();
        models = data.models || [];
        
        const select = document.getElementById('modelSelect');
        const checkboxes = document.getElementById('modelCheckboxes');
        
        select.innerHTML = models.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
        
        checkboxes.innerHTML = models.map(m => 
          `<label style="margin-right: 15px;"><input type="checkbox" value="${m.name}" checked> ${m.name}</label>`
        ).join('');
      } catch (e) {
        document.getElementById('modelSelect').innerHTML = '<option>无法连接 Ollama</option>';
      }
    }

    // 加载 Prompt 模板
    async function loadTemplates() {
      const res = await fetch('/api/prompts');
      const templates = await res.json();
      document.getElementById('templates').innerHTML = templates.map(t => 
        `<button class="template-btn" onclick="useTemplate('${t.prompt.replace(/'/g, "\\'")}')">${t.name}</button>`
      ).join('');
    }

    function useTemplate(prompt) {
      document.getElementById('prompt').value = prompt;
    }

    async function send() {
      const model = document.getElementById('modelSelect').value;
      const prompt = document.getElementById('prompt').value;
      if (!prompt) return alert('请输入内容');

      const responseDiv = document.getElementById('response');
      responseDiv.innerHTML = '<span class="loading">思考中...</span>';

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        responseDiv.textContent = data.message?.content || data.response || '无响应';
      } catch (e) {
        responseDiv.textContent = '错误：' + e.message;
      }
    }

    async function compare() {
      const prompt = document.getElementById('comparePrompt').value;
      if (!prompt) return alert('请输入内容');

      const checked = Array.from(document.querySelectorAll('#modelCheckboxes input:checked')).map(cb => cb.value);
      if (checked.length < 2) return alert('请至少选择两个模型');

      const responseDiv = document.getElementById('compareResponse');
      responseDiv.innerHTML = '<span class="loading">对比中...</span>';

      try {
        const res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ models: checked, prompt })
        });
        const data = await res.json();
        responseDiv.innerHTML = data.results.map(r => 
          `<div style="margin-bottom: 20px;"><strong>${r.model}:</strong><br>${r.response}</div>`
        ).join('<hr style="border-color: #333;">');
      } catch (e) {
        responseDiv.textContent = '错误：' + e.message;
      }
    }

    async function loadHistory() {
      const res = await fetch('/api/history');
      const history = await res.json();
      document.getElementById('history').innerHTML = history.reverse().map(h => 
        `<div class="history-item">
          <div class="meta">${new Date(h.timestamp).toLocaleString()} | ${h.model}</div>
          <div><strong>问:</strong> ${h.messages[0]?.content?.slice(0, 100)}...</div>
          <div><strong>答:</strong> ${h.response?.content?.slice(0, 100)}...</div>
        </div>`
      ).join('') || '<p style="color: #666;">暂无历史记录</p>';
    }

    async function clearHistory() {
      if (!confirm('确定清空历史记录？')) return;
      await fetch('/api/history', { method: 'DELETE' });
      loadHistory();
    }

    function clearPrompt() {
      document.getElementById('prompt').value = '';
      document.getElementById('response').textContent = '等待输入...';
    }

    // 导出对话历史
    async function exportHistory(format) {
      try {
        const res = await fetch('/api/history');
        const history = await res.json();
        
        if (history.length === 0) return alert('暂无历史记录可导出');
        
        if (format === 'md') {
          // 导出为 Markdown
          let md = '# Ollama Tools 对话历史\n\n';
          md += `导出时间：${new Date().toLocaleString('zh-CN')}\n\n`;
          md += `---\n\n`;
          
          history.reverse().forEach((h, i) => {
            md += `## 对话 ${i + 1}\n`;
            md += `**时间:** ${new Date(h.timestamp).toLocaleString('zh-CN')}\n`;
            md += `**模型:** ${h.model}\n\n`;
            md += `### 问:\n${h.messages[0]?.content || '无'}\n\n`;
            md += `### 答:\n${h.response?.content || '无'}\n\n`;
            md += `---\n\n`;
          });
          
          downloadFile(md, 'ollama-history.md', 'text/markdown');
        } else if (format === 'pdf') {
          // 导出为 PDF（使用浏览器打印）
          let printContent = '<html><head><title>Ollama Tools 对话历史</title>';
          printContent += '<style>body{font-family:Arial,sans-serif;padding:20px;} h1{color:#333;} .conversation{margin:20px 0;padding:15px;border:1px solid #ddd;border-radius:8px;} .meta{color:#666;font-size:12px;} h3{color:#e94560;}</style>';
          printContent += '</head><body>';
          printContent += '<h1>🦙 Ollama Tools 对话历史</h1>';
          printContent += `<p>导出时间：${new Date().toLocaleString('zh-CN')}</p><hr>`;
          
          history.reverse().forEach((h, i) => {
            printContent += `<div class="conversation">`;
            printContent += `<h3>对话 ${i + 1}</h3>`;
            printContent += `<p class="meta"><strong>时间:</strong> ${new Date(h.timestamp).toLocaleString('zh-CN')} | <strong>模型:</strong> ${h.model}</p>`;
            printContent += `<p><strong>问:</strong></p><p>${h.messages[0]?.content || '无'}</p>`;
            printContent += `<p><strong>答:</strong></p><p>${h.response?.content || '无'}</p>`;
            printContent += `</div><hr>`;
          });
          
          printContent += '</body></html>';
          
          // 打开新窗口打印
          const printWindow = window.open('', '_blank');
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.print();
        }
        
        alert('导出成功！');
      } catch (e) {
        alert('导出失败：' + e.message);
      }
    }

    // 下载文件辅助函数
    function downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // 初始化
    loadModels();
    loadTemplates();
    loadHistory();
  </script>
</body>
</html>
```

---

## 🚀 运行项目

### 1. 确保 Ollama 正在运行

```bash
ollama serve
```

### 2. 启动 Web 服务

```bash
cd ollama-tools
node src/server.js
```

你会看到：

```
🦙 Ollama Tools 已启动：http://localhost:3000
📡 Ollama 服务地址：http://localhost:11434
```

### 3. 打开浏览器

访问 **http://localhost:3000**

---

## 🎯 功能演示

### 1. 聊天功能
- 选择模型（自动加载你本地的所有模型）
- 点击 Prompt 模板快速填充
- 发送后等待响应

### 2. 多模型对比
- 勾选 2 个或更多模型
- 输入同一个问题
- 点击"开始对比"，同时看多个模型的回答

**对比场景示例：**
- 比较 qwen2.5 和 llama3.1 的代码能力
- 比较不同模型的中文理解能力
- 选择最适合你任务的模型

### 3. 对话历史
- 自动保存最近 50 条对话
- 支持导出 Markdown 文件
- 支持导出 PDF（调用浏览器打印）

### 4. Prompt 模板
内置 15 个实用模板：
- 💻 代码助手
- ✍️ 文案写作
- 🌐 翻译助手
- 📚 学习导师
- 📊 数据分析
- 📝 润色改写
- 🎯 周报生成
- 💡 头脑风暴
- 📧 邮件写作
- 🔍 简历优化
- 📱 小红书文案
- 🎬 短视频脚本
- 📖 读书总结
- 🍳 菜谱推荐
- 💼 面试模拟

---

## 🔧 进阶优化

### 1. 使用环境变量

创建 `.env` 文件：

```bash
PORT=3000
OLLAMA_URL=http://localhost:11434
```

在 `server.js` 中读取：

```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
```

### 2. 支持流式响应

修改 `/api/chat` 端点，支持 SSE 流式输出：

```javascript
app.post('/api/chat-stream', async (req, res) => {
  const fetch = (await import('node-fetch')).default;
  const { model, messages } = req.body;
  
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true })
  });
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  response.body.pipe(res);
});
```

### 3. 添加认证

简单的 API Key 认证：

```javascript
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: '未授权' });
  }
  next();
});
```

### 4. 使用数据库存储历史

用 SQLite 替代内存存储：

```bash
npm install better-sqlite3
```

```javascript
const Database = require('better-sqlite3');
const db = new Database('ollama-tools.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    model TEXT,
    messages TEXT,
    response TEXT
  )
`);

// 保存历史
app.post('/api/chat', async (req, res) => {
  // ... 聊天逻辑
  
  db.prepare(`
    INSERT INTO chat_history (timestamp, model, messages, response)
    VALUES (?, ?, ?, ?)
  `).run(
    new Date().toISOString(),
    model,
    JSON.stringify(messages),
    JSON.stringify(data.message)
  );
  
  res.json(data);
});
```

---

## 📦 部署

### 本地网络访问

```bash
# 允许局域网访问
node src/server.js

# 在其他设备上访问 http://你的 IP:3000
```

### 部署到服务器

1. 上传代码到服务器
2. 安装依赖：`npm install`
3. 使用 PM2 管理进程：

```bash
npm install -g pm2
pm2 start src/server.js --name ollama-tools
pm2 save
pm2 startup
```

4. 配置 Nginx 反向代理（可选）

---

## 🎁 完整代码

项目已开源在 GitHub：

**https://github.com/你的用户名/ollama-tools**

（记得替换成你的仓库链接）

---

## 📝 本章小结

**我们完成了：**
- ✅ Express 后端 API 开发
- ✅ 漂亮的 Web 聊天界面
- ✅ 多模型对比功能
- ✅ 对话历史管理
- ✅ Markdown/PDF 导出
- ✅ 15 个实用 Prompt 模板

**学到的技能：**
- Express.js 基础
- Fetch API 调用
- 前端与后端通信
- 简单的状态管理

---

## 🎯 下一章预告

**第 5 章：高级功能开发**
- 🎙️ 语音输入/输出
- 📷 图片理解（多模态）
- 🔌 插件系统
- 📊 使用统计面板

---

## 💖 支持作者

如果这个系列对你有帮助：

1. ⭐ 给 GitHub 项目点个 Star
2. 📢 分享给需要的朋友
3. 💰 赞助支持（爱发电/微信/支付宝）

你的支持是我持续更新的动力！

---

**系列文章：**
- [第 1 章：Ollama 入门](https://juejin.cn/spost/7614644305726423075)
- [第 2 章：API 详解](https://juejin.cn/spost/7614110147108716584)
- [第 3 章：API 调用实战](https://juejin.cn/post/7614747451153727540)
- **第 4 章：Web UI 开发**（本文）

**有问题？** 在评论区留言，我会尽快回复！
