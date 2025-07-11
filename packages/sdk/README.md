# Claudify

Use Claude Code as an LLM provider with your Claude Code subscription flat fee instead of pay-per-token API keys.

## Installation

```bash
npm install claudify
```

## Quick Start

### 1. Create a new project

```bash
npx claudify init my-app
cd my-app
npm install
npm start
```

### 2. Open in browser

Visit http://localhost:3000 to see the chat interface.

### 3. Test the API

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello Claude!"}'
```

## Features

- 💰 **Flat Fee**: Use your Claude Code Max subscription for unlimited LLM usage
- 🚀 **No Token Counting**: Stop worrying about API costs
- 🔌 **Simple Integration**: Drop-in SDK for any JavaScript/TypeScript project
- 🌐 **WebSocket Support**: Built-in Socket.io integration for real-time applications
- 📦 **CLI Tool**: Quick project scaffolding with `claudify init`
- 🔄 **Streaming Support**: Real-time response streaming with AsyncGenerator

## Usage

### Basic SDK Usage

```javascript
import { ClaudeCodeSDK } from 'claudify'

const sdk = new ClaudeCodeSDK()

// Simple prompt
const response = await sdk.executeWithClaudeCode('Hello, Claude!')
console.log(response.messages[0].content)

// With options
const response = await sdk.executeWithClaudeCode('Explain quantum computing', {
  modelId: 'sonnet',     // or 'opus', 'haiku'
  maxTokens: 1000,
  temperature: 0.7
})
```

### Streaming Responses

```javascript
const stream = sdk.streamWithClaudeCode('Write a story...')
for await (const chunk of stream) {
  process.stdout.write(chunk)
}
```

### WebSocket Server

```javascript
import { ClaudeCodeWebSocketServer } from 'claudify'

const server = new ClaudeCodeWebSocketServer({ port: 8080 })
// Connect with ws://localhost:8080
```

### Socket.io Integration

```javascript
import { createServer } from 'http'
import { ClaudeCodeSocketIOServer } from 'claudify'

const httpServer = createServer()
const claudeServer = new ClaudeCodeSocketIOServer(httpServer)

httpServer.listen(3000)
```

## API Reference

### ClaudeCodeSDK

#### `new ClaudeCodeSDK(options?)`

- `options.debug`: Enable debug logging (default: false)

#### `executeWithClaudeCode(prompt, options?)`

- `prompt`: The input prompt string
- `options.modelId`: Model to use ('sonnet', 'opus', 'haiku')
- `options.maxTokens`: Maximum tokens to generate
- `options.temperature`: Temperature for generation (0-1)
- `options.systemPrompt`: System prompt (can include '--continue' for conversation continuity)

Returns: `Promise<ClaudeCodeResponse>`

#### `streamWithClaudeCode(prompt, options?)`

Returns: `AsyncGenerator<string>` for streaming responses

#### `stopCurrentProcess()`

Stops the current Claude Code process if running.

#### `getCurrentConversationId()`

Returns the current conversation ID for continuity.

## CLI Commands

- `claudify init [project-name]` - Create a new Claudify project
- `claudify check` - Verify Claude Code installation
- `claudify help` - Show help information

## Requirements

- Node.js >= 18.0.0
- Claude Code CLI installed and authenticated
- Active Claude Code subscription

## Debugging

### Common Issues

1. **"Claude Code not found"**: Make sure Claude Code CLI is installed and in your PATH
2. **"Failed to connect"**: Ensure the server is running (`npm start`)
3. **CORS errors**: The server includes CORS support by default
4. **Model errors**: Not all models may be available with your subscription

### Debug Mode

Enable debug logging to see detailed information:

```javascript
const sdk = new ClaudeCodeSDK({ debug: true })
```

## License

MIT

## Contributing

See [CONTRIBUTING.md](https://github.com/neno-is-ooo/claudify/blob/main/CONTRIBUTING.md)

## Links

- [GitHub Repository](https://github.com/neno-is-ooo/claudify)
- [npm Package](https://www.npmjs.com/package/claudify)
- [Claude Code](https://claude.ai/code)