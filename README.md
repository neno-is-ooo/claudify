# Claudify

Use Claude Code as an LLM provider with your subscription flat fee instead of pay-per-token API keys.

## Installation

```bash
npm install claudify
```

Or install globally for the CLI:
```bash
npm install -g claudify
claudify init my-app
```

## Quick Start

```javascript
import { ClaudeCodeSDK } from 'claudify'

const sdk = new ClaudeCodeSDK()
const result = await sdk.executeWithClaudeCode("Hello Claude!")
console.log(result.messages[0].content)
```

## Prerequisites

1. Install [Claude Code CLI](https://claude.ai/code)
2. Login with `claude code login`
3. Have an active Claude Code subscription

## Why Claudify?

- **Flat Fee**: Use your Claude Code Max subscription for unlimited LLM usage
- **No Token Counting**: Stop worrying about API costs
- **Simple Integration**: Drop-in SDK for any JavaScript/TypeScript project

## Documentation

- [API Reference](./docs/API_REFERENCE.md)
- [Integration Guide](./docs/LLM_INTEGRATION_GUIDE.md) 
- [Examples](./examples/)

## Example: Express Server

```javascript
import express from 'express'
import { ClaudeCodeSDK } from 'claudify'

const app = express()
const sdk = new ClaudeCodeSDK()

app.post('/chat', async (req, res) => {
  const result = await sdk.executeWithClaudeCode(req.body.prompt)
  res.json({ response: result.messages[0].content })
})

app.listen(3000)
```

---

## Development

This section is for contributing to Claudify itself.

### Repository Structure

```
claudify/
├── packages/
│   ├── sdk/              # Core SDK package (published to npm)
│   └── demo/             # Demo application
│       ├── client/       # React frontend
│       └── server/       # Express backend
├── docs/                 # Documentation
└── examples/             # Example integrations
```

### Setup

```bash
# Clone repository
git clone https://github.com/neno-is-ooo/claudify.git
cd claudify

# Install dependencies
npm install

# Run demo
npm run demo
```

### Building

```bash
# Build SDK
npm run build:sdk

# Run tests
npm test

# Publish to npm
cd packages/sdk
npm publish
```

## License

MIT