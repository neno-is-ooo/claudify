# Claude Code SDK API Reference

## Table of Contents
- [ClaudeCodeSDK](#claudecodesdk)
- [MessageConverter](#messageconverter)
- [Types & Interfaces](#types--interfaces)
- [Error Handling](#error-handling)
- [Events](#events)

## ClaudeCodeSDK

The main SDK class for interacting with Claude Code CLI.

### Constructor
```typescript
new ClaudeCodeSDK(options?: SDKOptions)
```

#### Parameters
- `options` (optional): Configuration options
  - `debug?: boolean` - Enable debug logging (default: false)
  - `processTimeout?: number` - Process timeout in ms (default: 300000)
  - `maxRetries?: number` - Max retry attempts (default: 3)

#### Example
```typescript
const sdk = new ClaudeCodeSDK({ debug: true })
```

### Methods

#### executeWithClaudeCode
Execute a prompt with Claude Code and return the complete response.

```typescript
async executeWithClaudeCode(
  prompt: string,
  options?: ExecutionOptions
): Promise<ExecutionResult>
```

##### Parameters
- `prompt: string` - The prompt to send to Claude
- `options?: ExecutionOptions`
  - `workspacePath?: string` - Working directory context
  - `modelId?: 'sonnet' | 'opus'` - Model selection (default: 'sonnet')
  - `timeout?: number` - Execution timeout in ms
  - `continueSession?: boolean` - Continue previous session
  - `sessionId?: string` - Session identifier for continuity

##### Returns
```typescript
interface ExecutionResult {
  success: boolean
  messages: Array<{
    id: string
    type: 'assistant_message'
    content: string
    timestamp: number
    sessionId?: string
  }>
  metadata?: {
    api_duration_ms: number
    turns: number
    model: string
  }
  error?: string
}
```

##### Example
```typescript
const result = await sdk.executeWithClaudeCode(
  "Explain quantum computing",
  {
    modelId: 'opus',
    timeout: 60000,
    workspacePath: './my-project'
  }
)

if (result.success) {
  console.log(result.messages[0].content)
}
```

#### executeStreamingWithClaudeCode
Execute a prompt with streaming response.

```typescript
async *executeStreamingWithClaudeCode(
  prompt: string,
  options?: StreamingOptions
): AsyncGenerator<string>
```

##### Parameters
- `prompt: string` - The prompt to send to Claude
- `options?: StreamingOptions` - Same as ExecutionOptions

##### Returns
An async generator yielding content chunks as strings.

##### Example
```typescript
for await (const chunk of sdk.executeStreamingWithClaudeCode("Write a story")) {
  process.stdout.write(chunk)
}
```

### executeBatchWithClaudeCode
Execute multiple prompts in parallel (optimized for throughput).

```typescript
async executeBatchWithClaudeCode(
  prompts: string[],
  options?: BatchExecutionOptions
): Promise<BatchExecutionResult>
```

##### Parameters
- `prompts: string[]` - Array of prompts to execute
- `options?: BatchExecutionOptions`
  - Extends ExecutionOptions
  - `concurrency?: number` - Max parallel executions (default: 3)

##### Returns
```typescript
interface BatchExecutionResult {
  results: ExecutionResult[]
  summary: {
    total: number
    successful: number
    failed: number
    duration_ms: number
  }
}
```

##### Example
```typescript
const batch = await sdk.executeBatchWithClaudeCode([
  "Task 1",
  "Task 2",
  "Task 3"
], { concurrency: 2 })
```

## MessageConverter

Utility class for message format conversions and session management.

### Static Methods

#### generateSessionId
Generate a unique session identifier.

```typescript
static generateSessionId(): string
```

##### Example
```typescript
const sessionId = MessageConverter.generateSessionId()
// Returns: "session_1234567890_abcdef"
```

#### formatUserMessage
Format a user message for the API.

```typescript
static formatUserMessage(content: string, metadata?: MessageMetadata): UserMessage
```

##### Parameters
- `content: string` - Message content
- `metadata?: MessageMetadata`
  - `timestamp?: number`
  - `userId?: string`
  - `sessionId?: string`

##### Example
```typescript
const message = MessageConverter.formatUserMessage("Hello Claude", {
  sessionId: "session_123"
})
```

#### convertToAPIFormat
Convert messages to Claude Code API format.

```typescript
static convertToAPIFormat(messages: Message[]): APIMessage[]
```

#### parseStreamChunk
Parse a streaming response chunk.

```typescript
static parseStreamChunk(chunk: string): ParsedChunk | null
```

##### Returns
```typescript
interface ParsedChunk {
  type: 'content' | 'metadata' | 'error'
  data: string
  timestamp: number
}
```

## Types & Interfaces

### Core Types

```typescript
// Model types
type ModelId = 'sonnet' | 'opus'

// Message types
interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  metadata?: Record<string, any>
}

// Execution options
interface ExecutionOptions {
  workspacePath?: string
  modelId?: ModelId
  timeout?: number
  continueSession?: boolean
  sessionId?: string
}

// Streaming options
interface StreamingOptions extends ExecutionOptions {
  onChunk?: (chunk: string) => void
  bufferSize?: number
}

// SDK options
interface SDKOptions {
  debug?: boolean
  processTimeout?: number
  maxRetries?: number
  retryDelay?: number
}
```

### Response Types

```typescript
// Execution result
interface ExecutionResult {
  success: boolean
  messages: AssistantMessage[]
  metadata?: ExecutionMetadata
  error?: string
}

// Assistant message
interface AssistantMessage {
  id: string
  type: 'assistant_message'
  content: string
  timestamp: number
  sessionId?: string
}

// Execution metadata
interface ExecutionMetadata {
  api_duration_ms: number
  turns: number
  model: string
  streaming?: boolean
  chunks?: number
}
```

### Error Types

```typescript
// SDK errors
class ClaudeCodeError extends Error {
  code: ErrorCode
  details?: any
}

enum ErrorCode {
  CLI_NOT_FOUND = 'CLI_NOT_FOUND',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  PROCESS_TIMEOUT = 'PROCESS_TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

## Error Handling

### Common Errors and Solutions

#### CLI Not Found
```typescript
try {
  await sdk.executeWithClaudeCode(prompt)
} catch (error) {
  if (error.code === 'CLI_NOT_FOUND') {
    console.log('Please install Claude Code CLI')
    // Guide user to: https://claude.ai/code
  }
}
```

#### Authentication Error
```typescript
catch (error) {
  if (error.code === 'NOT_AUTHENTICATED') {
    console.log('Please run: claude code login')
  }
}
```

#### Timeout Error
```typescript
catch (error) {
  if (error.code === 'PROCESS_TIMEOUT') {
    // Retry with longer timeout
    await sdk.executeWithClaudeCode(prompt, {
      timeout: 120000 // 2 minutes
    })
  }
}
```

## Events

The SDK emits events for monitoring and debugging.

### Event Types

```typescript
sdk.on('process:start', (data: ProcessStartEvent) => {
  console.log(`Starting process ${data.processId}`)
})

sdk.on('process:output', (data: ProcessOutputEvent) => {
  console.log(`Output: ${data.content}`)
})

sdk.on('process:error', (data: ProcessErrorEvent) => {
  console.error(`Error: ${data.error}`)
})

sdk.on('process:complete', (data: ProcessCompleteEvent) => {
  console.log(`Completed in ${data.duration}ms`)
})
```

### Event Interfaces

```typescript
interface ProcessStartEvent {
  processId: string
  command: string
  args: string[]
  timestamp: number
}

interface ProcessOutputEvent {
  processId: string
  content: string
  type: 'stdout' | 'stderr'
  timestamp: number
}

interface ProcessErrorEvent {
  processId: string
  error: Error
  timestamp: number
}

interface ProcessCompleteEvent {
  processId: string
  exitCode: number
  duration: number
  timestamp: number
}
```

## Advanced Usage

### Custom Process Management

```typescript
class CustomSDK extends ClaudeCodeSDK {
  protected async spawnProcess(command: string, args: string[]) {
    // Custom process spawning logic
    return super.spawnProcess(command, args)
  }
}
```

### Response Caching

```typescript
const cache = new Map()

async function cachedExecute(prompt: string) {
  const cacheKey = `${prompt}-${Date.now()}`
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const result = await sdk.executeWithClaudeCode(prompt)
  cache.set(cacheKey, result)
  
  return result
}
```

### Rate Limiting

```typescript
import pLimit from 'p-limit'

const limit = pLimit(2) // Max 2 concurrent requests

async function rateLimitedExecute(prompts: string[]) {
  return Promise.all(
    prompts.map(prompt => 
      limit(() => sdk.executeWithClaudeCode(prompt))
    )
  )
}
```

## WebSocket Integration

### Server Setup

```typescript
import { Server } from 'socket.io'

io.on('connection', (socket) => {
  socket.on('claude:execute', async (data) => {
    try {
      if (data.streaming) {
        for await (const chunk of sdk.executeStreamingWithClaudeCode(data.prompt)) {
          socket.emit('claude:stream', { chunk })
        }
        socket.emit('claude:complete', { success: true })
      } else {
        const result = await sdk.executeWithClaudeCode(data.prompt)
        socket.emit('claude:response', result)
      }
    } catch (error) {
      socket.emit('claude:error', { error: error.message })
    }
  })
})
```

### Client Usage

```typescript
// Connect
const socket = io('ws://localhost:3001')

// Execute with streaming
socket.emit('claude:execute', {
  prompt: 'Write a poem',
  streaming: true
})

// Handle streaming chunks
socket.on('claude:stream', ({ chunk }) => {
  document.getElementById('output').innerHTML += chunk
})

// Handle complete response
socket.on('claude:response', (result) => {
  console.log(result.messages[0].content)
})
```

## Performance Optimization

### Connection Pooling

```typescript
class PooledSDK {
  private pool: ClaudeCodeSDK[] = []
  private poolSize = 3
  
  constructor() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(new ClaudeCodeSDK())
    }
  }
  
  async execute(prompt: string): Promise<ExecutionResult> {
    const sdk = this.pool[Math.floor(Math.random() * this.pool.length)]
    return sdk.executeWithClaudeCode(prompt)
  }
}
```

### Batch Processing

```typescript
async function processBatch(prompts: string[]) {
  const batchSize = 10
  const results = []
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize)
    const batchResults = await sdk.executeBatchWithClaudeCode(batch)
    results.push(...batchResults.results)
  }
  
  return results
}
```

## Migration Guide

### From v0.x to v1.x

```typescript
// Old (v0.x)
const result = await sdk.execute(prompt)

// New (v1.x)
const result = await sdk.executeWithClaudeCode(prompt, {
  modelId: 'sonnet'
})
```

### From Raw CLI Usage

```typescript
// Before: Direct CLI
exec('claude code "Your prompt"', (error, stdout) => {
  console.log(stdout)
})

// After: SDK
const result = await sdk.executeWithClaudeCode("Your prompt")
console.log(result.messages[0].content)
```

---

For more examples, see the `/examples` directory in the repository.