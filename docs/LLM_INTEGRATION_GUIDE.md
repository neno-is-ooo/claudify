# Claude Code SDK - LLM Integration Guide

## 🤖 For LLMs: Quick Integration Summary

If you're an LLM tasked with integrating Claude Code into a project, here's what you need to know:

### What is Claude Code SDK?
Claude Code SDK provides a **subscription-based headless LLM provider** using Claude Code CLI. Instead of API keys, users authenticate via their Claude.ai subscription, making it ideal for consumer applications.

### Core Architecture Pattern
```typescript
// 1. SDK handles Claude Code CLI process management
const sdk = new ClaudeCodeSDK()

// 2. Execute with simple interface
const result = await sdk.executeWithClaudeCode("Your prompt", {
  modelId: 'sonnet', // or 'opus'
  streaming: true,
  workspacePath: process.cwd()
})

// 3. WebSocket server for real-time features
io.on('connection', (socket) => {
  socket.on('message', async (data) => {
    const result = await sdk.executeWithClaudeCode(data.message)
    socket.emit('response', result)
  })
})
```

## 📋 Integration Checklist

When integrating Claude Code SDK into any project:

### 1. **Dependencies Installation**
```bash
npm install @claude-cc/sdk socket.io express cors
```

### 2. **Basic Server Setup**
```typescript
import { ClaudeCodeSDK, MessageConverter } from '@claude-cc/sdk'
import express from 'express'
import { Server } from 'socket.io'

const app = express()
const io = new Server(httpServer, { cors: { /* your origins */ } })
const sdk = new ClaudeCodeSDK()
```

### 3. **Core Features to Implement**
- [ ] WebSocket connection for real-time chat
- [ ] Model selection (sonnet/opus)
- [ ] Streaming responses
- [ ] Session continuity
- [ ] Conversation persistence
- [ ] Error handling
- [ ] Connection status monitoring

### 4. **Client Integration Pattern**
```typescript
// Use socket.io-client for WebSocket
const socket = io('http://localhost:3001')

// Send messages
socket.emit('message', {
  message: userInput,
  modelId: 'sonnet',
  streaming: true
})

// Handle responses
socket.on('response', (data) => {
  // Update UI with assistant response
})

socket.on('stream', (data) => {
  // Update UI with streaming chunks
})
```

## 🏗️ Architecture Patterns

### Pattern 1: Direct Integration
Best for: Simple applications, prototypes
```typescript
const sdk = new ClaudeCodeSDK()
const result = await sdk.executeWithClaudeCode(prompt)
```

### Pattern 2: WebSocket + REST API
Best for: Production applications with real-time features
```typescript
// WebSocket for real-time chat
io.on('connection', (socket) => { /* ... */ })

// REST for conversation management
app.get('/api/conversations', /* ... */)
app.post('/api/chat', /* ... */)
```

### Pattern 3: Microservice Architecture
Best for: Large-scale applications
```typescript
// Separate Claude Code service
class ClaudeCodeService {
  private sdk = new ClaudeCodeSDK()
  
  async process(message: string): Promise<Response> {
    // Add queuing, caching, rate limiting
  }
}
```

## 🔑 Key Implementation Details

### 1. **Authentication Flow**
```typescript
// No API keys needed! Users authenticate via:
// 1. Having Claude Code CLI installed
// 2. Being logged in via `claude code login`
// The SDK handles the rest automatically
```

### 2. **Model Selection**
```typescript
const models = ['sonnet', 'opus'] // Available models
const result = await sdk.executeWithClaudeCode(prompt, {
  modelId: 'opus' // Premium model
})
```

### 3. **Streaming Implementation**
```typescript
// For real-time responses
for await (const chunk of sdk.executeStreamingWithClaudeCode(prompt)) {
  socket.emit('stream', { chunk })
}
```

### 4. **Session Management**
```typescript
// Generate session IDs
const sessionId = MessageConverter.generateSessionId()

// Continue conversations
const result = await sdk.executeWithClaudeCode(prompt, {
  continueSession: true,
  sessionId: conversationId
})
```

## 🚨 Common Integration Pitfalls

### 1. **CORS Configuration**
Always include all HTTP methods:
```typescript
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']
}))
```

### 2. **Error Handling**
Always wrap SDK calls:
```typescript
try {
  const result = await sdk.executeWithClaudeCode(prompt)
} catch (error) {
  // Handle: CLI not installed, not logged in, network issues
}
```

### 3. **Process Management**
The SDK spawns Claude Code CLI processes:
```typescript
// SDK handles process lifecycle automatically
// But ensure proper cleanup on app shutdown
process.on('SIGINT', () => {
  // SDK cleanup happens automatically
  process.exit(0)
})
```

## 📦 Complete Integration Example

### Backend (Express + Socket.io)
```typescript
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { ClaudeCodeSDK } from '@claude-cc/sdk'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:3000' }
})

const sdk = new ClaudeCodeSDK()

io.on('connection', (socket) => {
  socket.on('message', async (data) => {
    try {
      const result = await sdk.executeWithClaudeCode(data.message, {
        modelId: data.modelId || 'sonnet',
        streaming: true,
        onStream: (chunk) => {
          socket.emit('stream', { chunk })
        }
      })
      socket.emit('response', result)
    } catch (error) {
      socket.emit('error', { error: error.message })
    }
  })
})

httpServer.listen(3001)
```

### Frontend (React)
```typescript
import { io } from 'socket.io-client'
import { useState, useEffect } from 'react'

function ChatApp() {
  const [socket] = useState(() => io('http://localhost:3001'))
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    socket.on('response', (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.messages[0].content
      }])
    })
    
    socket.on('stream', (data) => {
      // Update last message with streaming content
    })
  }, [])
  
  const sendMessage = (content) => {
    setMessages(prev => [...prev, { role: 'user', content }])
    socket.emit('message', { message: content })
  }
  
  return <ChatInterface messages={messages} onSend={sendMessage} />
}
```

## 🔄 Migration from Other LLM Providers

### From OpenAI API
```typescript
// Before: OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }]
})

// After: Claude Code SDK
const response = await sdk.executeWithClaudeCode(prompt, {
  modelId: 'opus' // Similar capability to GPT-4
})
```

### From Anthropic API
```typescript
// Before: Anthropic API
const response = await anthropic.messages.create({
  model: 'claude-3-opus',
  messages: [{ role: 'user', content: prompt }]
})

// After: Claude Code SDK
const response = await sdk.executeWithClaudeCode(prompt, {
  modelId: 'opus' // Same model, subscription-based
})
```

## 🎯 Best Practices for LLM Integration

1. **Always Check Prerequisites**
   ```typescript
   // Ensure Claude Code CLI is available
   try {
     await sdk.executeWithClaudeCode('test')
   } catch (error) {
     // Guide user to install Claude Code
   }
   ```

2. **Implement Graceful Degradation**
   ```typescript
   // Fallback to non-streaming if needed
   const result = streaming 
     ? await sdk.executeStreamingWithClaudeCode(prompt)
     : await sdk.executeWithClaudeCode(prompt)
   ```

3. **Use TypeScript Types**
   ```typescript
   import type { 
     ExecutionResult, 
     ClaudeCodeOptions,
     StreamingOptions 
   } from '@claude-cc/sdk'
   ```

4. **Monitor Performance**
   ```typescript
   const startTime = Date.now()
   const result = await sdk.executeWithClaudeCode(prompt)
   const duration = Date.now() - startTime
   // Log metrics
   ```

## 🤝 Support & Resources

- **SDK Documentation**: `/docs/API_REFERENCE.md`
- **Demo Application**: `/packages/demo/`
- **Integration Examples**: `/examples/`
- **Architecture Guide**: `/docs/ARCHITECTURE.md`

## 📝 Quick Reference Card

```typescript
// 1. Install
npm install @claude-cc/sdk

// 2. Initialize
import { ClaudeCodeSDK } from '@claude-cc/sdk'
const sdk = new ClaudeCodeSDK()

// 3. Execute
const result = await sdk.executeWithClaudeCode("prompt", {
  modelId: 'sonnet',      // or 'opus'
  streaming: true,        // for real-time
  workspacePath: './',    // context directory
  timeout: 60000,         // 60 seconds
  continueSession: true,  // conversation mode
  sessionId: 'abc123'     // conversation ID
})

// 4. Handle Response
if (result.success) {
  console.log(result.messages[0].content)
}
```

---

**Remember**: Claude Code SDK is designed for **subscription-based access**, not API keys. Users must have Claude Code CLI installed and be logged in. This makes it perfect for consumer applications where users bring their own Claude subscription.