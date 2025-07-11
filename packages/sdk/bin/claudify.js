#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEMPLATES = {
  'package.json': `{
  "name": "claudify-app",
  "version": "1.0.0",
  "description": "A Claudify-powered application",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "claudify": "^1.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  }
}`,

  'index.js': `import express from 'express'
import cors from 'cors'
import { ClaudeCodeSDK } from 'claudify'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const sdk = new ClaudeCodeSDK()

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

// Serve client.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'))
})

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { prompt, model = 'sonnet' } = req.body
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' })
    }
    
    const result = await sdk.executeWithClaudeCode(prompt, {
      modelId: model
    })
    
    res.json({
      response: result.messages[0].content,
      model: model
    })
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      code: error.code 
    })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(\`🚀 Claudify server running on http://localhost:\${PORT}\`)
  console.log(\`🌐 Open http://localhost:\${PORT} in your browser\`)
  console.log('📝 API endpoint: POST /chat with { "prompt": "Hello!" }')
})
`,

  'client.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Claudify Demo</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .chat-container { border: 1px solid #ddd; border-radius: 8px; padding: 20px; min-height: 400px; }
        .message { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .user { background: #e3f2fd; text-align: right; }
        .assistant { background: #f5f5f5; }
        .input-area { margin-top: 20px; display: flex; gap: 10px; }
        input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #1565c0; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .error { color: #d32f2f; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Claudify Demo</h1>
    <p>Chat with Claude Code using your subscription</p>
    
    <div class="chat-container" id="chat"></div>
    <div class="error" id="error"></div>
    <div class="input-area">
        <input type="text" id="input" placeholder="Type your message..." />
        <button id="send">Send</button>
    </div>

    <script>
        const API_URL = 'http://localhost:3000'
        const chat = document.getElementById('chat')
        const input = document.getElementById('input')
        const send = document.getElementById('send')
        const error = document.getElementById('error')

        function addMessage(content, role) {
            const div = document.createElement('div')
            div.className = \`message \${role}\`
            div.textContent = content
            chat.appendChild(div)
            chat.scrollTop = chat.scrollHeight
        }

        async function sendMessage() {
            const prompt = input.value.trim()
            if (!prompt) return

            error.textContent = ''
            send.disabled = true
            input.disabled = true

            addMessage(prompt, 'user')
            input.value = ''

            try {
                const response = await fetch(\`\${API_URL}/chat\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                })

                const data = await response.json()
                
                if (response.ok) {
                    addMessage(data.response, 'assistant')
                } else {
                    error.textContent = \`Error: \${data.error}\`
                }
            } catch (err) {
                error.textContent = \`Network error: \${err.message}. Make sure the server is running.\`
            } finally {
                send.disabled = false
                input.disabled = false
                input.focus()
            }
        }

        send.addEventListener('click', sendMessage)
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !send.disabled) sendMessage()
        })

        // Check server status
        fetch(API_URL)
            .then(r => r.json())
            .then(data => console.log('Server status:', data))
            .catch(() => error.textContent = 'Cannot connect to server. Run npm start first.')
    </script>
</body>
</html>`,

  'README.md': `# Claudify App

This is a starter app using Claudify - Claude Code as an LLM provider.

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Make sure you have Claude Code installed and authenticated

3. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

4. Open \`client.html\` in your browser

## API Endpoints

- \`GET /\` - Health check
- \`POST /chat\` - Send chat messages

## Learn More

- [Claudify Documentation](https://github.com/neno-is-ooo/claudify)
- [Claude Code](https://claude.ai/code)
`
}

async function initProject(projectName = '.') {
  const targetDir = path.resolve(process.cwd(), projectName)
  
  console.log('\x1b[34m\n🚀 Creating Claudify project in ' + targetDir + '...\x1b[0m')
  
  // Create directory if needed
  if (projectName !== '.') {
    await fs.mkdir(targetDir, { recursive: true })
  }
  
  // Write all template files
  for (const [filename, content] of Object.entries(TEMPLATES)) {
    await fs.writeFile(path.join(targetDir, filename), content)
  }
  
  console.log('\x1b[32m\n✅ Project created!\x1b[0m')
  console.log('\x1b[0m\nNext steps:\x1b[0m')
  if (projectName !== '.') {
    console.log(`\x1b[33m  cd ${projectName}\x1b[0m`)
  }
  console.log('\x1b[33m  npm install\x1b[0m')
  console.log('\x1b[33m  npm start\x1b[0m')
  console.log('\x1b[34m\nThen open client.html in your browser\x1b[0m')
}

async function checkClaudeCode() {
  const { spawn } = await import('child_process')
  
  return new Promise((resolve) => {
    const proc = spawn('claude', ['--version'], { stdio: 'pipe' })
    
    proc.on('error', () => resolve(false))
    proc.on('close', (code) => resolve(code === 0))
  })
}

async function main() {
  const [,, command, ...args] = process.argv
  
  switch (command) {
    case 'init':
      await initProject(args[0])
      break
      
    case 'check':
      const hasClaudeCode = await checkClaudeCode()
      if (hasClaudeCode) {
        console.log('\x1b[32m✅ Claude Code is installed and ready!\x1b[0m')
      } else {
        console.log('\x1b[31m❌ Claude Code not found. Please install it first.\x1b[0m')
        console.log('Visit: https://claude.ai/code')
      }
      break
      
    case 'help':
    default:
      console.log(`
\x1b[36mClaudify CLI\x1b[0m
Use Claude Code as an LLM provider with your subscription flat fee

\x1b[33mUsage:\x1b[0m
  claudify <command> [options]

\x1b[33mCommands:\x1b[0m
  init [name]    Create a new Claudify project
  check          Check if Claude Code is installed
  help           Show this help message

\x1b[33mExamples:\x1b[0m
  claudify init my-app    Create project in my-app directory
  claudify init           Create project in current directory
  claudify check          Verify Claude Code installation

\x1b[36mMore info: https://github.com/neno-is-ooo/claudify\x1b[0m
`)
  }
}

main().catch(console.error)