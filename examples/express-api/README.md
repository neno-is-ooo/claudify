# Express API Example

RESTful API server demonstrating Claude Code SDK integration with Express.js.

## Features

- REST API endpoints
- Streaming responses (Server-Sent Events)
- Batch processing
- Error handling
- CORS enabled
- Request logging

## API Endpoints

### Execute Single Prompt
```bash
POST /api/execute
Content-Type: application/json

{
  "prompt": "Explain quantum computing",
  "model": "sonnet",      // optional: "sonnet" or "opus"
  "sessionId": "abc123",  // optional: for conversation continuity
  "streaming": false      // optional: true for SSE streaming
}
```

### Execute Batch
```bash
POST /api/execute/batch
Content-Type: application/json

{
  "prompts": [
    "Task 1",
    "Task 2",
    "Task 3"
  ],
  "model": "sonnet",
  "concurrency": 3        // optional: max parallel executions
}
```

### List Models
```bash
GET /api/models
```

### Health Check
```bash
GET /health
```

## Usage

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode with auto-reload
npm run dev

# Run API tests
npm test
```

## Example Requests

### Basic Execution
```javascript
const response = await fetch('http://localhost:3000/api/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Hello Claude!',
    model: 'sonnet'
  })
})

const data = await response.json()
console.log(data.response)
```

### Streaming Response
```javascript
const response = await fetch('http://localhost:3000/api/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Write a story',
    streaming: true
  })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value)
  // Process Server-Sent Event chunks
  console.log(chunk)
}
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DEBUG` - Enable SDK debug logging (true/false)

## Error Responses

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error codes:
- `MISSING_PROMPT` - No prompt provided
- `INVALID_MODEL` - Invalid model ID
- `CLI_NOT_FOUND` - Claude Code CLI not installed
- `EXECUTION_ERROR` - General execution error