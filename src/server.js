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
