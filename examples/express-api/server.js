/**
 * Express API Example
 * 
 * RESTful API server using Claude Code SDK
 * Demonstrates integration with Express.js
 */

import express from 'express'
import cors from 'cors'
import { ClaudeCodeSDK } from '@claude-cc/sdk'

// Initialize Express
const app = express()
const PORT = process.env.PORT || 3000

// Initialize SDK
const sdk = new ClaudeCodeSDK({
  debug: process.env.DEBUG === 'true'
})

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'claude-code-api'
  })
})

// Execute prompt - POST /api/execute
app.post('/api/execute', async (req, res) => {
  const { prompt, model = 'sonnet', sessionId, streaming = false } = req.body

  if (!prompt) {
    return res.status(400).json({
      error: 'Prompt is required',
      code: 'MISSING_PROMPT'
    })
  }

  // Validate model
  if (!['sonnet', 'opus'].includes(model)) {
    return res.status(400).json({
      error: 'Invalid model. Use "sonnet" or "opus"',
      code: 'INVALID_MODEL'
    })
  }

  try {
    const startTime = Date.now()

    if (streaming) {
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // Stream response
      for await (const chunk of sdk.executeStreamingWithClaudeCode(prompt, {
        modelId: model,
        continueSession: !!sessionId,
        sessionId
      })) {
        // Send as Server-Sent Event
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({ 
        done: true, 
        duration: Date.now() - startTime 
      })}\n\n`)
      
      res.end()
    } else {
      // Non-streaming response
      const result = await sdk.executeWithClaudeCode(prompt, {
        modelId: model,
        continueSession: !!sessionId,
        sessionId
      })

      res.json({
        success: result.success,
        response: result.messages[0]?.content || '',
        model,
        sessionId: sessionId || null,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Execution error:', error)
    
    const statusCode = error.code === 'CLI_NOT_FOUND' ? 503 : 500
    
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'EXECUTION_ERROR',
      timestamp: new Date().toISOString()
    })
  }
})

// Batch execution - POST /api/execute/batch
app.post('/api/execute/batch', async (req, res) => {
  const { prompts, model = 'sonnet', concurrency = 3 } = req.body

  if (!Array.isArray(prompts) || prompts.length === 0) {
    return res.status(400).json({
      error: 'Prompts array is required',
      code: 'MISSING_PROMPTS'
    })
  }

  if (prompts.length > 10) {
    return res.status(400).json({
      error: 'Maximum 10 prompts allowed per batch',
      code: 'TOO_MANY_PROMPTS'
    })
  }

  try {
    const startTime = Date.now()
    
    const results = await sdk.executeBatchWithClaudeCode(prompts, {
      modelId: model,
      concurrency: Math.min(concurrency, 5) // Cap at 5
    })

    res.json({
      success: true,
      results: results.results.map((r, i) => ({
        prompt: prompts[i],
        response: r.success ? r.messages[0]?.content : null,
        success: r.success,
        error: r.error || null
      })),
      summary: results.summary,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Batch execution error:', error)
    
    res.status(500).json({
      error: error.message,
      code: 'BATCH_EXECUTION_ERROR',
      timestamp: new Date().toISOString()
    })
  }
})

// Get available models - GET /api/models
app.get('/api/models', (req, res) => {
  res.json({
    models: [
      {
        id: 'sonnet',
        name: 'Claude Sonnet',
        description: 'Fast and efficient for most tasks',
        default: true
      },
      {
        id: 'opus',
        name: 'Claude Opus',
        description: 'Most capable model for complex tasks',
        default: false
      }
    ]
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Claude Code API server running on http://localhost:${PORT}`)
  console.log(`📚 Try: POST http://localhost:${PORT}/api/execute`)
  console.log(`📋 Endpoints:`)
  console.log(`   - POST /api/execute       - Execute single prompt`)
  console.log(`   - POST /api/execute/batch - Execute multiple prompts`)
  console.log(`   - GET  /api/models        - List available models`)
  console.log(`   - GET  /health            - Health check`)
})