# 第 5 章：高级功能开发 - 语音、图片、统计面板

> 系列文章：
> - [第 1 章：Ollama 入门](https://juejin.cn/spost/7614644305726423075)
> - [第 2 章：API 详解](https://juejin.cn/spost/7614110147108716584)
> - [第 3 章：API 调用实战](https://juejin.cn/post/7614747451153727540)
> - [第 4 章：Web UI 开发](https://juejin.cn/post/7614451900677849103)
> - **第 5 章：高级功能开发**（本文）

---

## 📖 前言

前 4 章我们完成了：
- ✅ Ollama 基础安装和使用
- ✅ API 调用（Python/Node.js）
- ✅ Web UI 聊天界面
- ✅ 多模型对比、历史记录

这一章我们来添加**高级功能**，让 Ollama Tools 更强大：

**本章新增：**
- 🎙️ 语音输入/输出（Web Speech API）
- 📷 图片理解（多模态模型）
- 📊 使用统计面板
- ⚡ 流式响应（打字机效果）
- 🔌 插件系统基础

**在线演示：** （部署后补充链接）

---

## 🎙️ 功能 1：语音输入/输出

### 原理说明

使用浏览器原生的 **Web Speech API**：
- `SpeechRecognition` - 语音识别（说话转文字）
- `SpeechSynthesis` - 语音合成（文字转语音）

**优点：**
- 无需额外 API 密钥
- 完全本地运行
- 隐私安全

### 前端实现

修改 `src/webui/index.html`，添加语音功能：

```html
<!-- 在聊天卡片中添加语音按钮 -->
<div class="card">
  <h2>💬 聊天</h2>
  <select id="modelSelect"><option>加载中...</option></select>
  
  <!-- 语音控制区域 -->
  <div class="voice-controls">
    <button id="voiceInput" onclick="toggleVoiceInput()" class="voice-btn">
      🎤 语音输入
    </button>
    <button id="voiceOutput" onclick="toggleVoiceOutput()" class="voice-btn">
      🔊 语音输出：<span id="voiceStatus">关闭</span>
    </button>
  </div>
  
  <div class="templates" id="templates"></div>
  <textarea id="prompt" placeholder="输入你的问题..."></textarea>
  <div style="margin-top: 15px;">
    <button onclick="send()">发送</button>
    <button class="secondary" onclick="clearPrompt()">清空</button>
  </div>
  <div id="response" class="response">等待输入...</div>
</div>

<!-- 添加语音相关样式 -->
<style>
.voice-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.voice-btn {
  background: #0f3460;
  padding: 8px 16px;
  font-size: 13px;
  flex: 1;
}

.voice-btn.active {
  background: #e94560;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.listening {
  border: 2px solid #e94560;
  animation: listening-border 1s infinite;
}

@keyframes listening-border {
  0%, 100% { box-shadow: 0 0 5px #e94560; }
  50% { box-shadow: 0 0 20px #e94560; }
}
</style>
```

### JavaScript 实现

```javascript
// 语音状态
let isVoiceInputActive = false;
let isVoiceOutputEnabled = false;
let recognition = null;

// 初始化语音识别
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('你的浏览器不支持语音识别，请使用 Chrome 或 Edge');
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = true;
  
  recognition.onstart = () => {
    document.getElementById('voiceInput').classList.add('active');
    document.getElementById('prompt').classList.add('listening');
  };
  
  recognition.onend = () => {
    document.getElementById('voiceInput').classList.remove('active');
    document.getElementById('prompt').classList.remove('listening');
  };
  
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');
    document.getElementById('prompt').value = transcript;
  };
  
  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error);
    alert('语音识别出错：' + event.error);
  };
}

// 切换语音输入
function toggleVoiceInput() {
  if (!recognition) {
    initSpeechRecognition();
  }
  
  if (isVoiceInputActive) {
    recognition.stop();
    isVoiceInputActive = false;
  } else {
    recognition.start();
    isVoiceInputActive = true;
  }
}

// 切换语音输出
function toggleVoiceOutput() {
  isVoiceOutputEnabled = !isVoiceOutputEnabled;
  document.getElementById('voiceStatus').textContent = isVoiceOutputEnabled ? '开启' : '关闭';
  document.getElementById('voiceOutput').classList.toggle('active', isVoiceOutputEnabled);
}

// 语音合成（文字转语音）
function speak(text) {
  if (!isVoiceOutputEnabled) return;
  
  // 停止当前正在播放的语音
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.0; // 语速
  utterance.pitch = 1.0; // 音调
  utterance.volume = 1.0; // 音量
  
  // 选择中文语音（如果有）
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(voice => voice.lang.includes('zh'));
  if (zhVoice) {
    utterance.voice = zhVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

// 修改 send() 函数，添加语音输出
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
    const responseText = data.message?.content || data.response || '无响应';
    responseDiv.textContent = responseText;
    
    // 朗读回复
    speak(responseText);
  } catch (e) {
    responseDiv.textContent = '错误：' + e.message;
  }
}

// 页面加载时初始化
window.addEventListener('load', () => {
  loadModels();
  loadTemplates();
  loadHistory();
  initSpeechRecognition();
  
  // 加载语音列表
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
});
```

---

## 📷 功能 2：图片理解（多模态）

### 原理说明

Ollama 支持多模态模型（如 `llava`、`bakllava`），可以：
- 识别图片内容
- 回答关于图片的问题
- OCR 文字识别

### 后端实现

修改 `src/server.js`，添加图片上传和处理：

```javascript
const multer = require('multer');
const fs = require('fs');

// 配置文件上传
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB 限制
});

// 图片上传接口
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '未上传文件' });
    }
    
    // 读取图片并转换为 base64
    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = imageBuffer.toString('base64');
    
    // 返回 base64 和图片路径
    res.json({
      success: true,
      path: file.path,
      base64: base64Image,
      mimetype: file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 多模态聊天接口
app.post('/api/chat-vision', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const { model, messages, images } = req.body;
    
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model, 
        messages,
        images // Ollama 支持 base64 图片数组
      })
    });
    
    const data = await response.json();
    
    chatHistory.push({
      timestamp: new Date().toISOString(),
      model,
      messages,
      images,
      response: data.message
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 前端实现

```html
<!-- 添加图片上传区域 -->
<div class="card">
  <h2>📷 图片理解</h2>
  <div class="image-upload-area">
    <input type="file" id="imageInput" accept="image/*" onchange="previewImage()" style="display: none;">
    <button onclick="document.getElementById('imageInput').click()" class="upload-btn">
      📁 选择图片
    </button>
    <div id="imagePreview" class="image-preview"></div>
  </div>
  <textarea id="visionPrompt" placeholder="描述你想问关于这张图片的问题..."></textarea>
  <button onclick="sendVision()" class="vision-btn">🔍 分析图片</button>
  <div id="visionResponse" class="response">等待上传图片...</div>
</div>

<style>
.image-upload-area {
  border: 2px dashed #333;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 15px;
}

.upload-btn {
  background: #0f3460;
  padding: 10px 20px;
}

.image-preview {
  margin-top: 15px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.vision-btn {
  background: #00b894;
  width: 100%;
  margin-top: 10px;
}
</style>

<script>
let currentImageBase64 = null;

// 预览图片
function previewImage() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageBase64 = e.target.result.split(',')[1]; // 去掉 data:image/...;base64,
    document.getElementById('imagePreview').innerHTML = 
      `<img src="${e.target.result}" alt="预览图片">`;
  };
  reader.readAsDataURL(file);
}

// 发送图片分析请求
async function sendVision() {
  if (!currentImageBase64) return alert('请先选择图片');
  
  const prompt = document.getElementById('visionPrompt').value || '请描述这张图片的内容';
  const model = document.getElementById('modelSelect').value;
  
  const responseDiv = document.getElementById('visionResponse');
  responseDiv.innerHTML = '<span class="loading">分析中...</span>';
  
  try {
    const res = await fetch('/api/chat-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.includes('llava') ? model : 'llava:7b', // 自动切换到 llava
        messages: [{ role: 'user', content: prompt }],
        images: [currentImageBase64]
      })
    });
    
    const data = await res.json();
    responseDiv.textContent = data.message?.content || '无响应';
    
    // 朗读回复
    speak(data.message?.content);
  } catch (e) {
    responseDiv.textContent = '错误：' + e.message;
  }
}
</script>
```

---

## 📊 功能 3：使用统计面板

### 后端实现

添加统计接口：

```javascript
// 使用统计
let stats = {
  totalRequests: 0,
  totalTokens: 0,
  modelsUsed: {},
  dailyUsage: {}
};

// 统计中间件
app.use((req, res, next) => {
  if (req.path === '/api/chat' || req.path === '/api/chat-vision') {
    stats.totalRequests++;
    
    const today = new Date().toISOString().split('T')[0];
    stats.dailyUsage[today] = (stats.dailyUsage[today] || 0) + 1;
  }
  next();
});

// 获取统计信息
app.get('/api/stats', (req, res) => {
  res.json({
    totalRequests: stats.totalRequests,
    totalTokens: stats.totalTokens,
    modelsUsed: stats.modelsUsed,
    dailyUsage: stats.dailyUsage,
    topModels: Object.entries(stats.modelsUsed)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  });
});

// 重置统计
app.post('/api/stats/reset', (req, res) => {
  stats = {
    totalRequests: 0,
    totalTokens: 0,
    modelsUsed: {},
    dailyUsage: {}
  };
  res.json({ success: true });
});
```

### 前端实现

```html
<!-- 添加统计面板 -->
<div class="card" style="margin-top: 20px;">
  <h2>📊 使用统计</h2>
  <div class="stats-grid">
    <div class="stat-item">
      <div class="stat-value" id="totalRequests">0</div>
      <div class="stat-label">总请求数</div>
    </div>
    <div class="stat-item">
      <div class="stat-value" id="todayRequests">0</div>
      <div class="stat-label">今日请求</div>
    </div>
    <div class="stat-item">
      <div class="stat-value" id="topModel">-</div>
      <div class="stat-label">最常用模型</div>
    </div>
  </div>
  <div style="margin-top: 15px;">
    <button class="secondary" onclick="loadStats()">刷新</button>
    <button class="secondary" onclick="resetStats()">重置</button>
  </div>
  <div id="usageChart" class="chart"></div>
</div>

<style>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  background: #0f0f23;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2.5em;
  color: #e94560;
  font-weight: bold;
}

.stat-label {
  color: #888;
  margin-top: 5px;
}

.chart {
  margin-top: 20px;
  height: 200px;
  background: #0f0f23;
  border-radius: 8px;
  padding: 15px;
}
</style>

<script>
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    
    document.getElementById('totalRequests').textContent = stats.totalRequests;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('todayRequests').textContent = stats.dailyUsage[today] || 0;
    
    if (stats.topModels && stats.topModels.length > 0) {
      document.getElementById('topModel').textContent = stats.topModels[0][0];
    }
    
    // 绘制简单的使用趋势图
    renderUsageChart(stats.dailyUsage);
  } catch (e) {
    console.error('加载统计失败:', e);
  }
}

function renderUsageChart(dailyUsage) {
  const chartDiv = document.getElementById('usageChart');
  const entries = Object.entries(dailyUsage).slice(-7); // 最近 7 天
  
  if (entries.length === 0) {
    chartDiv.innerHTML = '<p style="color: #666; text-align: center;">暂无使用数据</p>';
    return;
  }
  
  const maxValue = Math.max(...entries.map(e => e[1]));
  
  let html = '<div style="display: flex; align-items: flex-end; height: 150px; gap: 10px; padding: 10px;">';
  entries.forEach(([date, count]) => {
    const height = (count / maxValue) * 100;
    html += `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100%; background: #e94560; height: ${height}%; border-radius: 4px 4px 0 0;"></div>
        <div style="font-size: 10px; color: #888; margin-top: 5px;">${date.slice(5)}</div>
      </div>
    `;
  });
  html += '</div>';
  
  chartDiv.innerHTML = html;
}

async function resetStats() {
  if (!confirm('确定重置所有统计数据？')) return;
  
  await fetch('/api/stats/reset', { method: 'POST' });
  loadStats();
}

// 初始化时加载统计
loadStats();
</script>
```

---

## ⚡ 功能 4：流式响应（打字机效果）

### 后端实现

```javascript
// 流式聊天接口
app.post('/api/chat-stream', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const { model, messages } = req.body;
    
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true })
    });
    
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 流式传输
    response.body.on('data', (chunk) => {
      res.write(chunk);
    });
    
    response.body.on('end', () => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 前端实现

```javascript
// 流式发送
async function sendStream() {
  const model = document.getElementById('modelSelect').value;
  const prompt = document.getElementById('prompt').value;
  if (!prompt) return alert('请输入内容');

  const responseDiv = document.getElementById('response');
  responseDiv.innerHTML = '';
  
  let fullResponse = '';

  try {
    const res = await fetch('/api/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.message?.content) {
              fullResponse += data.message.content;
              responseDiv.textContent = fullResponse;
              
              // 实时滚动到底部
              responseDiv.scrollTop = responseDiv.scrollHeight;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
    
    // 完成后朗读
    speak(fullResponse);
  } catch (e) {
    responseDiv.textContent = '错误：' + e.message;
  }
}
```

---

## 🚀 运行项目

### 1. 安装新依赖

```bash
cd ollama-tools
npm install multer
```

### 2. 确保 Ollama 正在运行

```bash
ollama serve
```

### 3. 拉取多模态模型（可选）

```bash
ollama pull llava:7b
```

### 4. 启动服务

```bash
node src/server.js
```

### 5. 打开浏览器

访问 **http://localhost:3000**

---

## 🎯 功能演示

### 语音功能
1. 点击"语音输入"按钮
2. 对着麦克风说话
3. 自动转换为文字
4. 点击"语音输出"开启朗读

### 图片理解
1. 点击"选择图片"
2. 上传任意图片
3. 输入问题（或留空使用默认问题）
4. 点击"分析图片"

### 统计面板
- 实时查看使用数据
- 7 天使用趋势图
- 最常用模型排行

### 流式响应
- 打字机效果
- 实时显示回复
- 更低的首次响应延迟

---

## 📝 本章小结

**新增功能：**
- ✅ 语音输入/输出
- ✅ 图片理解（多模态）
- ✅ 使用统计面板
- ✅ 流式响应

**学到的技能：**
- Web Speech API
- 文件上传处理
- SSE 流式传输
- 数据可视化

---

## 🎯 下一章预告

**第 6 章：部署与优化**
- 🚀 服务器部署（Docker）
- 🔒 HTTPS 配置
- ⚡ 性能优化
- 📱 PWA 支持

---

## 💖 支持作者

如果这个系列对你有帮助：

1. ⭐ 给 GitHub 项目点个 Star
2. 📢 分享给需要的朋友
3. 💰 赞助支持（爱发电/微信/支付宝）

**系列文章：**
- [第 1 章：Ollama 入门](https://juejin.cn/spost/7614644305726423075)
- [第 2 章：API 详解](https://juejin.cn/spost/7614110147108716584)
- [第 3 章：API 调用实战](https://juejin.cn/post/7614747451153727540)
- [第 4 章：Web UI 开发](https://juejin.cn/post/7614451900677849103)
- **第 5 章：高级功能开发**（本文）

**有问题？** 在评论区留言，我会尽快回复！
