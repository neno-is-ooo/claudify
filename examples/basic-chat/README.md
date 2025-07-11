# Basic Chat Example

A simple terminal-based chat interface demonstrating basic Claude Code SDK usage.

## Features

- Terminal-based chat interface
- Model switching (Sonnet/Opus)
- Session continuity
- Streaming responses
- Command system

## Usage

```bash
# Install dependencies
npm install

# Run the chat
npm start

# Or with auto-reload during development
npm run dev
```

## Commands

- `/opus` - Switch to Opus model
- `/sonnet` - Switch to Sonnet model  
- `/status` - Show session status
- `/help` - Show help
- `clear` - Clear chat history
- `exit` - Exit the chat

## Code Overview

```javascript
// Initialize SDK
const sdk = new ClaudeCodeSDK()

// Stream response
for await (const chunk of sdk.executeStreamingWithClaudeCode(prompt)) {
  process.stdout.write(chunk)
}
```

This example demonstrates:
- Basic SDK initialization
- Streaming execution
- Session management
- Error handling