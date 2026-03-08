# 第三章：API 调用实战

> 掌握 Ollama API，让你的应用与本地 AI 对话

---

## 3.1 基础 API 使用

### Ollama API 介绍

Ollama 提供了简洁的 REST API，让你可以在自己的应用中调用本地模型。

**API 地址：** `http://localhost:11434`

**主要端点：**

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/generate` | POST | 生成文本（单次完成） |
| `/api/chat` | POST | 对话（支持多轮） |
| `/api/tags` | GET | 查看已安装的模型 |
| `/api/show` | POST | 查看模型详情 |
| `/api/pull` | POST | 下载模型 |
| `/api/delete` | DELETE | 删除模型 |

---

### 快速测试：用 curl 调用 API

#### 测试 1：查看已安装的模型

```bash
curl http://localhost:11434/api/tags
```

**返回：**
```json
{
  "models": [
    {
      "name": "qwen2.5:7b",
      "size": 4700000000,
      "modified_at": "2026-03-08T18:00:00.000Z"
    }
  ]
}
```

---

#### 测试 2：生成文本

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "你好，请用一句话介绍你自己",
  "stream": false
}'
```

**返回：**
```json
{
  "model": "qwen2.5:7b",
  "response": "你好！我是一个人工智能助手，可以帮你回答问题、写作、编程等。有什么我可以帮你的吗？",
  "done": true,
  "total_duration": 1234567890,
  "load_duration": 123456789,
  "prompt_eval_count": 15,
  "eval_count": 32,
  "eval_duration": 987654321
}
```

---

#### 测试 3：流式输出（实时显示）

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "请用 Python 写一个 Hello World",
  "stream": true
}'
```

**返回（多行 JSON，每行一个片段）：**
```json
{"model":"qwen2.5:7b","response":"```python","done":false}
{"model":"qwen2.5:7b","response":"print","done":false}
{"model":"qwen2.5:7b","response":"(","done":false}
{"model":"qwen2.5:7b","response":"\"","done":false}
{"model":"qwen2.5:7b","response":"Hello","done":false}
...
{"model":"qwen2.5:7b","response":"","done":true,"total_duration":1234567890}
```

> 💡 **提示：** `stream: true` 适合聊天界面，可以实时显示回答；`stream: false` 适合一次性获取完整结果。

---

## 3.2 Python 调用示例

### 环境准备

```bash
# 安装 requests 库
pip install requests
```

---

### 示例 1：基础调用（同步）

```python
import requests
import json

def ask_ollama(prompt, model="qwen2.5:7b"):
    """
    向 Ollama 发送问题并获取回答
    """
    url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False  # 不流式，等待完整结果
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    return result["response"]

# 测试
if __name__ == "__main__":
    answer = ask_ollama("你好，请用一句话介绍你自己")
    print(answer)
```

**运行结果：**
```
你好！我是一个人工智能助手，可以帮你回答问题、写作、编程等。有什么我可以帮你的吗？
```

---

### 示例 2：流式输出（实时显示）

```python
import requests
import json

def ask_ollama_stream(prompt, model="qwen2.5:7b"):
    """
    流式输出，实时显示回答
    """
    url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True
    }
    
    response = requests.post(url, json=payload, stream=True)
    
    for line in response.iter_lines():
        if line:
            result = json.loads(line)
            # 实时打印每个片段
            print(result.get("response", ""), end="", flush=True)
            
            # 如果完成，打印统计信息
            if result.get("done", False):
                print("\n")
                print(f"生成时间：{result.get('total_duration', 0) / 1e9:.2f}秒")
                print(f"输出 token 数：{result.get('eval_count', 0)}")

# 测试
if __name__ == "__main__":
    ask_ollama_stream("请用 Python 写一个快速排序算法")
```

**运行效果：**
```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

生成时间：3.45 秒
输出 token 数：128
```

---

### 示例 3：多轮对话（聊天机器人）

```python
import requests
import json

class OllamaChat:
    """
    多轮对话聊天机器人
    """
    
    def __init__(self, model="qwen2.5:7b"):
        self.model = model
        self.history = []  # 对话历史
    
    def chat(self, user_input):
        """
        发送消息并获取回复
        """
        url = "http://localhost:11434/api/chat"
        
        # 添加用户消息到历史
        self.history.append({
            "role": "user",
            "content": user_input
        })
        
        payload = {
            "model": self.model,
            "messages": self.history,
            "stream": False
        }
        
        response = requests.post(url, json=payload)
        result = response.json()
        
        # 获取 AI 回复
        ai_reply = result["message"]["content"]
        
        # 添加 AI 回复到历史
        self.history.append({
            "role": "assistant",
            "content": ai_reply
        })
        
        return ai_reply
    
    def clear_history(self):
        """
        清空对话历史
        """
        self.history = []
        print("对话历史已清空")

# 测试
if __name__ == "__main__":
    chat = OllamaChat()
    
    print("🤖 聊天机器人已启动！输入 'quit' 退出，'clear' 清空历史\n")
    
    while True:
        user_input = input("你：")
        
        if user_input.lower() == "quit":
            print("再见！")
            break
        elif user_input.lower() == "clear":
            chat.clear_history()
            continue
        
        ai_reply = chat.chat(user_input)
        print(f"AI：{ai_reply}\n")
```

**运行效果：**
```
🤖 聊天机器人已启动！输入 'quit' 退出，'clear' 清空历史

你：你好
AI：你好！有什么我可以帮助你的吗？

你：我想学习 Python，有什么建议吗？
AI：学习 Python 是个很好的选择！以下是一些建议：
1. 从基础语法开始...
（完整回答）

你：clear
对话历史已清空

你：quit
再见！
```

---

### 示例 4：带系统提示词的对话

```python
import requests

def ask_with_system(prompt, system_prompt, model="qwen2.5:7b"):
    """
    带系统提示词的对话
    """
    url = "http://localhost:11434/api/chat"
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": False
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    return result["message"]["content"]

# 测试：代码审查助手
if __name__ == "__main__":
    code = """
def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total
"""
    
    system_prompt = """你是一个专业的代码审查助手。
请审查代码，指出问题并提供改进建议。"""
    
    review = ask_with_system(
        f"请审查以下代码：\n{code}",
        system_prompt
    )
    
    print(review)
```

**运行结果：**
```
代码审查结果：

这段代码可以优化：

1. 可以使用 enumerate() 替代 range(len())
2. 可以使用 sum() 内置函数简化

优化版本：
def calculate_sum(numbers):
    return sum(numbers)

或者使用更 Pythonic 的写法：
calculate_sum = sum
```

---

## 3.3 Node.js 调用示例

### 环境准备

```bash
# 创建项目
mkdir ollama-node-demo
cd ollama-node-demo
npm init -y

# 安装 axios
npm install axios
```

---

### 示例 1：基础调用

```javascript
// index.js
const axios = require('axios');

async function askOllama(prompt, model = 'qwen2.5:7b') {
    const url = 'http://localhost:11434/api/generate';
    
    const payload = {
        model: model,
        prompt: prompt,
        stream: false
    };
    
    const response = await axios.post(url, payload);
    return response.data.response;
}

// 测试
(async () => {
    const answer = await askOllama('你好，请用一句话介绍你自己');
    console.log(answer);
})();
```

**运行：**
```bash
node index.js
```

---

### 示例 2：流式输出

```javascript
// stream.js
const axios = require('axios');

async function askOllamaStream(prompt, model = 'qwen2.5:7b') {
    const url = 'http://localhost:11434/api/generate';
    
    const payload = {
        model: model,
        prompt: prompt,
        stream: true
    };
    
    const response = await axios.post(url, payload, {
        responseType: 'stream'
    });
    
    return new Promise((resolve, reject) => {
        let fullResponse = '';
        
        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        process.stdout.write(data.response || '');
                        
                        if (data.done) {
                            console.log('\n');
                            console.log(`生成时间：${(data.total_duration / 1e9).toFixed(2)}秒`);
                            resolve(fullResponse);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        });
        
        response.data.on('error', reject);
    });
}

// 测试
(async () => {
    await askOllamaStream('请用 JavaScript 写一个快速排序算法');
})();
```

---

### 示例 3：多轮对话（聊天机器人）

```javascript
// chat.js
const axios = require('axios');
const readline = require('readline');

class OllamaChat {
    constructor(model = 'qwen2.5:7b') {
        this.model = model;
        this.history = [];
    }
    
    async chat(userInput) {
        // 添加用户消息
        this.history.push({
            role: 'user',
            content: userInput
        });
        
        const url = 'http://localhost:11434/api/chat';
        
        const payload = {
            model: this.model,
            messages: this.history,
            stream: false
        };
        
        const response = await axios.post(url, payload);
        const aiReply = response.data.message.content;
        
        // 添加 AI 回复
        this.history.push({
            role: 'assistant',
            content: aiReply
        });
        
        return aiReply;
    }
    
    clearHistory() {
        this.history = [];
        console.log('对话历史已清空');
    }
}

// 主程序
(async () => {
    const chat = new OllamaChat();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log('🤖 聊天机器人已启动！输入 quit 退出，clear 清空历史\n');
    
    const askQuestion = () => {
        return new Promise((resolve) => {
            rl.question('你：', resolve);
        });
    };
    
    while (true) {
        const userInput = await askQuestion();
        
        if (userInput.toLowerCase() === 'quit') {
            console.log('再见！');
            rl.close();
            break;
        } else if (userInput.toLowerCase() === 'clear') {
            chat.clearHistory();
            continue;
        }
        
        const aiReply = await chat.chat(userInput);
        console.log(`AI：${aiReply}\n`);
    }
})();
```

---

## 3.4 错误处理

### 常见错误码

| 错误 | 状态码 | 原因 | 解决方法 |
|------|--------|------|----------|
| **Connection Refused** | - | Ollama 服务未启动 | 运行 `ollama serve` |
| **Model Not Found** | 404 | 模型未下载 | 运行 `ollama pull <模型>` |
| **Out of Memory** | 500 | 内存不足 | 关闭其他程序或使用更小的模型 |
| **Context Too Long** | 400 | 输入超出上下文限制 | 减少输入长度或创建大上下文模型 |
| **Rate Limited** | 429 | 请求太频繁 | 添加延迟或重试机制 |

---

### 完整的错误处理示例（Python）

```python
import requests
import time
from requests.exceptions import ConnectionError, Timeout

class OllamaClient:
    """
    带错误处理的 Ollama 客户端
    """
    
    def __init__(self, model="qwen2.5:7b", base_url="http://localhost:11434"):
        self.model = model
        self.base_url = base_url
        self.max_retries = 3
        self.retry_delay = 1  # 秒
    
    def ask(self, prompt, stream=False):
        """
        发送问题，带重试机制
        """
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": stream
        }
        
        for attempt in range(self.max_retries):
            try:
                response = requests.post(url, json=payload, timeout=60)
                
                # 检查 HTTP 状态码
                if response.status_code == 404:
                    raise Exception(f"模型 '{self.model}' 未找到，请先运行：ollama pull {self.model}")
                elif response.status_code == 500:
                    raise Exception("服务器错误，可能是内存不足")
                elif response.status_code != 200:
                    raise Exception(f"HTTP 错误：{response.status_code}")
                
                if stream:
                    return self._parse_stream(response)
                else:
                    return response.json()["response"]
                    
            except ConnectionError:
                if attempt == self.max_retries - 1:
                    raise Exception("无法连接到 Ollama 服务，请确保已运行：ollama serve")
                print(f"连接失败，{self.retry_delay}秒后重试...")
                time.sleep(self.retry_delay)
                
            except Timeout:
                if attempt == self.max_retries - 1:
                    raise Exception("请求超时，请重试")
                print(f"请求超时，{self.retry_delay}秒后重试...")
                time.sleep(self.retry_delay)
                
            except Exception as e:
                # 其他错误，直接抛出
                raise e
        
        return None
    
    def _parse_stream(self, response):
        """
        解析流式响应
        """
        import json
        full_response = ""
        
        for line in response.iter_lines():
            if line:
                try:
                    data = json.loads(line)
                    full_response += data.get("response", "")
                    
                    if data.get("done", False):
                        return full_response
                except json.JSONDecodeError:
                    continue
        
        return full_response
    
    def check_health(self):
        """
        检查 Ollama 服务是否可用
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                print(f"✅ Ollama 服务正常，已安装 {len(models)} 个模型")
                return True
            else:
                print(f"❌ HTTP 错误：{response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 无法连接到 Ollama 服务：{e}")
            return False

# 测试
if __name__ == "__main__":
    client = OllamaClient()
    
    # 检查服务状态
    if not client.check_health():
        print("\n请先启动 Ollama 服务：ollama serve")
        exit(1)
    
    # 发送问题
    try:
        answer = client.ask("你好，请用一句话介绍你自己")
        print(f"\nAI：{answer}")
    except Exception as e:
        print(f"错误：{e}")
```

**运行结果：**
```
✅ Ollama 服务正常，已安装 1 个模型

AI：你好！我是一个人工智能助手，可以帮你回答问题、写作、编程等。有什么我可以帮你的吗？
```

---

### 日志记录示例

```python
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ollama.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class LoggedOllamaClient:
    """
    带日志记录的 Ollama 客户端
    """
    
    def __init__(self, model="qwen2.5:7b"):
        self.model = model
        self.logger = logging.getLogger(__name__)
    
    def ask(self, prompt):
        """
        发送问题并记录日志
        """
        self.logger.info(f"用户提问：{prompt[:50]}...")
        
        try:
            import requests
            url = "http://localhost:11434/api/generate"
            
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
            
            start_time = datetime.now()
            response = requests.post(url, json=payload, timeout=60)
            end_time = datetime.now()
            
            duration = (end_time - start_time).total_seconds()
            result = response.json()
            answer = result["response"]
            
            self.logger.info(f"AI 回答（{duration:.2f}秒）：{answer[:50]}...")
            
            return answer
            
        except Exception as e:
            self.logger.error(f"请求失败：{e}")
            raise

# 测试
if __name__ == "__main__":
    client = LoggedOllamaClient()
    client.ask("你好")
```

**日志文件 (ollama.log)：**
```
2026-03-08 21:00:00,123 - INFO - 用户提问：你好...
2026-03-08 21:00:02,456 - INFO - AI 回答（2.33 秒）：你好！我是一个人工智能助手，可以帮你回答问...
```

---

## 3.5 实战项目：命令行聊天工具

### 完整代码

```python
# ollama-cli.py
import requests
import json
import sys
from datetime import datetime

class OllamaCLI:
    """
    命令行聊天工具
    """
    
    def __init__(self, model="qwen2.5:7b"):
        self.model = model
        self.base_url = "http://localhost:11434"
        self.history = []
        self.stats = {
            "total_requests": 0,
            "total_tokens": 0,
            "start_time": datetime.now()
        }
    
    def chat(self, user_input):
        """
        发送消息并获取回复
        """
        url = f"{self.base_url}/api/chat"
        
        # 添加用户消息
        self.history.append({
            "role": "user",
            "content": user_input
        })
        
        payload = {
            "model": self.model,
            "messages": self.history,
            "stream": False
        }
        
        try:
            response = requests.post(url, json=payload, timeout=120)
            result = response.json()
            
            # 获取 AI 回复
            ai_reply = result["message"]["content"]
            
            # 添加 AI 回复到历史
            self.history.append({
                "role": "assistant",
                "content": ai_reply
            })
            
            # 更新统计
            self.stats["total_requests"] += 1
            self.stats["total_tokens"] += result.get("eval_count", 0)
            
            return ai_reply
            
        except requests.exceptions.ConnectionError:
            return "❌ 错误：无法连接到 Ollama 服务，请运行 'ollama serve'"
        except requests.exceptions.Timeout:
            return "❌ 错误：请求超时，请重试"
        except Exception as e:
            return f"❌ 错误：{e}"
    
    def show_stats(self):
        """
        显示使用统计
        """
        duration = datetime.now() - self.stats["start_time"]
        print(f"\n📊 使用统计")
        print(f"   对话轮数：{self.stats['total_requests']}")
        print(f"   生成 token 数：{self.stats['total_tokens']}")
        print(f"   运行时长：{duration}")
        print(f"   当前模型：{self.model}\n")
    
    def export_history(self, filename="chat_history.md"):
        """
        导出对话历史为 Markdown
        """
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"# 对话历史\n\n")
            f.write(f"模型：{self.model}\n")
            f.write(f"时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"---\n\n")
            
            for msg in self.history:
                role = "👤 用户" if msg["role"] == "user" else "🤖 AI"
                f.write(f"### {role}\n\n")
                f.write(f"{msg['content']}\n\n")
                f.write(f"---\n\n")
        
        print(f"✅ 对话历史已导出到：{filename}")
    
    def clear_history(self):
        """
        清空对话历史
        """
        self.history = []
        print("✅ 对话历史已清空\n")

def print_help():
    """
    打印帮助信息
    """
    print("""
📖 命令列表：
   /help     - 显示帮助
   /stats    - 显示使用统计
   /clear    - 清空对话历史
   /export   - 导出对话历史
   /model    - 查看/切换模型
   /quit     - 退出程序
""")

def main():
    """
    主程序
    """
    print("=" * 50)
    print("🦙 Ollama 命令行聊天工具")
    print("=" * 50)
    print(f"当前模型：qwen2.5:7b")
    print("输入 /help 查看命令列表\n")
    
    client = OllamaCLI()
    
    while True:
        try:
            user_input = input("👤 你：").strip()
            
            if not user_input:
                continue
            
            # 处理命令
            if user_input.startswith("/"):
                cmd = user_input.lower()
                
                if cmd in ["/quit", "/exit", "/q"]:
                    print("👋 再见！")
                    break
                elif cmd == "/help":
                    print_help()
                elif cmd == "/stats":
                    client.show_stats()
                elif cmd == "/clear":
                    client.clear_history()
                elif cmd == "/export":
                    client.export_history()
                elif cmd.startswith("/model"):
                    parts = user_input.split(maxsplit=1)
                    if len(parts) == 2:
                        client.model = parts[1]
                        print(f"✅ 已切换到模型：{client.model}\n")
                    else:
                        print(f"当前模型：{client.model}\n")
                else:
                    print(f"❌ 未知命令：{user_input}，输入 /help 查看帮助\n")
            else:
                # 普通对话
                ai_reply = client.chat(user_input)
                print(f"\n🤖 AI：{ai_reply}\n")
                
        except KeyboardInterrupt:
            print("\n👋 再见！")
            break
        except EOFError:
            break

if __name__ == "__main__":
    main()
```

---

### 使用方法

```bash
# 运行
python ollama-cli.py

# 对话示例
👤 你：你好
🤖 AI：你好！有什么我可以帮助你的吗？

👤 你：/stats
📊 使用统计
   对话轮数：1
   生成 token 数：32
   运行时长：0:01:23
   当前模型：qwen2.5:7b

👤 你：/export
✅ 对话历史已导出到：chat_history.md

👤 你：/quit
👋 再见！
```

---

## 本章小结

恭喜！你已经学会了：

- ✅ Ollama API 基础使用
- ✅ Python 调用示例（同步/流式/多轮对话）
- ✅ Node.js 调用示例
- ✅ 错误处理与日志记录
- ✅ 实战项目：命令行聊天工具

### 下一章预告

第四章我们将学习：
- Web UI 项目架构
- 对话界面开发
- Prompt 模板系统
- 部署上线

---

## 课后作业

1. **基础练习：** 用 Python 或 Node.js 写一个简单的问答程序
2. **进阶练习：** 实现一个带历史记录的聊天机器人
3. **挑战练习：** 添加导出功能，支持 Markdown/PDF 格式

**完成后可以在评论区分享你的作品！** 💬

---

## 系列文章

- 第一章：[Ollama 入门](./CHAPTER_1.md)
- 第二章：[模型选择与优化](./CHAPTER_2.md)
- 第三章：API 调用实战（本文）
- 第四章：Web UI 开发（计划中）

---

**项目地址：** https://github.com/954215110/ollama-tools

**觉得有用的话，点个 Star 支持一下！** ⭐

---

_下一章：[第四章：Web UI 开发](./CHAPTER_4.md)（计划中）_
