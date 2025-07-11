# Next.js Integration Example

Full Next.js 14 application with App Router demonstrating Claude Code SDK integration.

## Features

- Next.js 14 with App Router
- Server-side SDK integration
- API routes for Claude execution
- Real-time chat interface
- Streaming responses
- TypeScript support

## Quick Start

```bash
# Create new Next.js app
npx create-next-app@latest claude-chat-app --typescript --app

# Copy the example files
cp -r examples/nextjs-integration/* claude-chat-app/

# Install dependencies
cd claude-chat-app
npm install @claude-cc/sdk

# Run development server
npm run dev
```

## Project Structure

```
app/
├── api/
│   └── claude/
│       └── route.ts      # API endpoint for Claude
├── components/
│   ├── ChatInterface.tsx # Main chat UI
│   └── MessageList.tsx   # Message display
├── hooks/
│   └── useClaudeChat.ts  # Custom hook for chat
├── layout.tsx
└── page.tsx              # Home page
```

## API Route Implementation

```typescript
// app/api/claude/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ClaudeCodeSDK } from '@claude-cc/sdk'

const sdk = new ClaudeCodeSDK()

export async function POST(request: NextRequest) {
  const { prompt, model = 'sonnet', sessionId } = await request.json()

  try {
    const result = await sdk.executeWithClaudeCode(prompt, {
      modelId: model,
      sessionId
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## Streaming API Route

```typescript
// app/api/claude/stream/route.ts
export async function POST(request: NextRequest) {
  const { prompt } = await request.json()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of sdk.executeStreamingWithClaudeCode(prompt)) {
          controller.enqueue(new TextEncoder().encode(chunk))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked'
    }
  })
}
```

## Client Hook

```typescript
// hooks/useClaudeChat.ts
import { useState } from 'react'

export function useClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (content: string) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content })
      })
      
      const data = await response.json()
      // Handle response
    } finally {
      setLoading(false)
    }
  }

  return { messages, sendMessage, loading }
}
```

## Features to Implement

1. **Streaming Responses** - Use EventSource or fetch streams
2. **Session Management** - Store session IDs in cookies/localStorage
3. **Model Selection** - UI to switch between Sonnet/Opus
4. **Error Handling** - Toast notifications for errors
5. **Loading States** - Skeleton screens while processing
6. **Export Chat** - Download conversation as JSON/Markdown

## Environment Variables

Create `.env.local`:
```
# Optional configuration
CLAUDE_DEBUG=false
```

## Deployment

Deploy to Vercel:
```bash
vercel
```

Note: Ensure Claude Code CLI is available in the deployment environment.