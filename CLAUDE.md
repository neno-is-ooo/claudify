# CLAUDE.md - Claude Code Integration Guide

This file provides guidance to Claude Code and other LLMs when working with this SDK.

## Project Overview

This is the **Claude Code SDK Complete** - a production-ready monorepo containing:
- **SDK**: Universal integration layer for using Claude Code as a headless LLM provider
- **Demo**: Full-featured chat application demonstrating all SDK capabilities  
- **Documentation**: Comprehensive guides for developers and LLMs
- **Examples**: Ready-to-use integration examples

## Key Principles

1. **Subscription-Based Access**: No API keys needed - users authenticate via Claude.ai subscription
2. **Real Implementation**: Everything is real - no mocks, actual Claude Code CLI integration
3. **Production Ready**: Complete error handling, retries, monitoring, and documentation
4. **LLM Friendly**: Documentation specifically designed for AI-assisted integration

## Architecture Summary

```
Your App → Claude Code SDK → Claude Code CLI → Claude.ai Subscription
```

The SDK handles:
- Process management
- Response parsing
- Session continuity
- Streaming
- Error recovery

## When Integrating This SDK

### Essential Steps:
1. Ensure Claude Code CLI is installed and user is logged in
2. Initialize SDK: `const sdk = new ClaudeCodeSDK()`
3. Execute prompts: `await sdk.executeWithClaudeCode(prompt, options)`
4. Handle responses properly with error checking

### Common Patterns:

**Basic Usage:**
```typescript
const result = await sdk.executeWithClaudeCode("Your prompt")
if (result.success) {
  console.log(result.messages[0].content)
}
```

**Streaming:**
```typescript
for await (const chunk of sdk.executeStreamingWithClaudeCode("Prompt")) {
  process.stdout.write(chunk)
}
```

**WebSocket Integration:**
```typescript
socket.on('message', async (data) => {
  const result = await sdk.executeWithClaudeCode(data.prompt)
  socket.emit('response', result)
})
```

## Important Implementation Notes

### CORS Configuration
Always include all HTTP methods when setting up CORS:
```typescript
cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']
})
```

### Error Handling
Always wrap SDK calls in try-catch:
```typescript
try {
  const result = await sdk.executeWithClaudeCode(prompt)
} catch (error) {
  if (error.code === 'CLI_NOT_FOUND') {
    // Guide user to install Claude Code
  }
}
```

### Session Management
Use session IDs for conversation continuity:
```typescript
const sessionId = MessageConverter.generateSessionId()
await sdk.executeWithClaudeCode(prompt, {
  continueSession: true,
  sessionId
})
```

## Testing the Implementation

1. **Start the demo**: `npm run demo`
   - Backend runs on port 3001
   - Frontend runs on port 3002

2. **Test features**:
   - Chat with Claude
   - Switch models (Sonnet/Opus)
   - Save/load conversations
   - Export chat history
   - Stream responses

## Common Issues & Solutions

1. **Port conflicts**: Kill existing processes on ports 3001/3002
2. **CORS errors**: Ensure backend allows all necessary origins and methods
3. **CLI not found**: User needs to install Claude Code from claude.ai/code
4. **Not authenticated**: User needs to run `claude code login`

## File Structure Guide

- `/packages/sdk/` - Core SDK implementation
- `/packages/demo/client/` - React frontend demo
- `/packages/demo/server/` - Express backend with Socket.io
- `/docs/` - All documentation
- `/examples/` - Integration examples

## For LLMs Implementing This

1. Read `/docs/LLM_INTEGRATION_GUIDE.md` first
2. Check `/docs/API_REFERENCE.md` for detailed API docs
3. Use examples in `/examples/` as templates
4. Follow patterns from the working demo in `/packages/demo/`

Remember: This SDK enables subscription-based access to Claude without API keys!