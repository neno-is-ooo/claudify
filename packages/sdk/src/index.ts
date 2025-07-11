import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import WebSocket from 'ws'
import { Server as SocketIOServer } from 'socket.io'
import { io as SocketIOClient, Socket } from 'socket.io-client'

export interface ClaudeCodeOptions {
  modelId?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  stream?: boolean
}

export interface ClaudeCodeResponse {
  messages: Array<{
    role: 'assistant' | 'user'
    content: string
  }>
  conversationId: string
  timestamp: number
}

export class ClaudeCodeSDK extends EventEmitter {
  private claudeProcess: ChildProcess | null = null
  private responseBuffer: string = ''
  private currentConversationId: string | null = null
  private isProcessing: boolean = false
  private debug: boolean

  constructor(options: { debug?: boolean } = {}) {
    super()
    this.debug = options.debug || false
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[ClaudeCodeSDK]', ...args)
    }
  }

  async executeWithClaudeCode(prompt: string, options: ClaudeCodeOptions = {}): Promise<ClaudeCodeResponse> {
    if (this.isProcessing) {
      throw new Error('Claude Code is already processing a request')
    }

    this.isProcessing = true
    this.responseBuffer = ''
    this.currentConversationId = options.systemPrompt?.includes('--continue') 
      ? this.currentConversationId 
      : uuidv4()

    return new Promise((resolve, reject) => {
      const args = ['code']
      
      if (options.modelId) {
        args.push('--model', options.modelId)
      }
      
      if (options.maxTokens) {
        args.push('--max-tokens', options.maxTokens.toString())
      }

      if (this.currentConversationId && options.systemPrompt?.includes('--continue')) {
        args.push('--continue', this.currentConversationId)
      }

      this.log('Spawning claude with args:', args)
      
      this.claudeProcess = spawn('claude', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, TERM: 'dumb' }
      })

      const timeout = setTimeout(() => {
        if (this.claudeProcess) {
          this.claudeProcess.kill()
          this.isProcessing = false
          reject(new Error('Claude Code request timed out'))
        }
      }, 300000) // 5 minute timeout

      this.claudeProcess.stdout?.on('data', (data) => {
        const chunk = data.toString()
        this.log('Received chunk:', chunk)
        this.responseBuffer += chunk
        this.emit('data', chunk)
      })

      this.claudeProcess.stderr?.on('data', (data) => {
        this.log('Error output:', data.toString())
        this.emit('error', data.toString())
      })

      this.claudeProcess.on('close', (code) => {
        clearTimeout(timeout)
        this.isProcessing = false
        this.log('Process closed with code:', code)

        if (code === 0) {
          resolve({
            messages: [{
              role: 'assistant',
              content: this.responseBuffer.trim()
            }],
            conversationId: this.currentConversationId!,
            timestamp: Date.now()
          })
        } else {
          reject(new Error(`Claude Code exited with code ${code}`))
        }

        this.claudeProcess = null
      })

      this.claudeProcess.on('error', (err) => {
        clearTimeout(timeout)
        this.isProcessing = false
        this.log('Process error:', err)
        reject(err)
        this.claudeProcess = null
      })

      // Send the prompt
      if (this.claudeProcess.stdin) {
        this.claudeProcess.stdin.write(prompt + '\n')
        this.claudeProcess.stdin.end()
      }
    })
  }

  async *streamWithClaudeCode(prompt: string, options: ClaudeCodeOptions = {}): AsyncGenerator<string, void, unknown> {
    this.responseBuffer = ''
    this.currentConversationId = options.systemPrompt?.includes('--continue') 
      ? this.currentConversationId 
      : uuidv4()

    const args = ['code']
    
    if (options.modelId) {
      args.push('--model', options.modelId)
    }
    
    if (options.maxTokens) {
      args.push('--max-tokens', options.maxTokens.toString())
    }

    if (this.currentConversationId && options.systemPrompt?.includes('--continue')) {
      args.push('--continue', this.currentConversationId)
    }

    this.log('Spawning claude with args:', args)
    
    this.claudeProcess = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, TERM: 'dumb' }
    })

    const chunks: string[] = []
    let isDone = false

    this.claudeProcess.stdout?.on('data', (data) => {
      const chunk = data.toString()
      this.log('Received chunk:', chunk)
      chunks.push(chunk)
      this.responseBuffer += chunk
    })

    this.claudeProcess.stderr?.on('data', (data) => {
      this.log('Error output:', data.toString())
      this.emit('error', data.toString())
    })

    this.claudeProcess.on('close', (code) => {
      this.log('Process closed with code:', code)
      isDone = true
      if (code !== 0) {
        chunks.push(`\nError: Claude Code exited with code ${code}`)
      }
      this.claudeProcess = null
    })

    this.claudeProcess.on('error', (err) => {
      this.log('Process error:', err)
      isDone = true
      chunks.push(`\nError: ${err.message}`)
      this.claudeProcess = null
    })

    // Send the prompt
    if (this.claudeProcess.stdin) {
      this.claudeProcess.stdin.write(prompt + '\n')
      this.claudeProcess.stdin.end()
    }

    // Yield chunks as they come in
    while (!isDone || chunks.length > 0) {
      if (chunks.length > 0) {
        yield chunks.shift()!
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  stopCurrentProcess(): void {
    if (this.claudeProcess) {
      this.claudeProcess.kill()
      this.claudeProcess = null
      this.isProcessing = false
    }
  }

  getCurrentConversationId(): string | null {
    return this.currentConversationId
  }
}

// WebSocket integration
export class ClaudeCodeWebSocketServer {
  private wss: WebSocket.Server
  private sdk: ClaudeCodeSDK

  constructor(options: { port: number }) {
    this.wss = new WebSocket.Server({ port: options.port })
    this.sdk = new ClaudeCodeSDK()
    this.setupWebSocketHandlers()
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws) => {
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString())
          
          if (data.type === 'chat') {
            const response = await this.sdk.executeWithClaudeCode(data.prompt, data.options)
            ws.send(JSON.stringify({ type: 'response', data: response }))
          }
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: (error as Error).message 
          }))
        }
      })
    })
  }
}

// Socket.io integration
export class ClaudeCodeSocketIOServer {
  private io: SocketIOServer
  private sdk: ClaudeCodeSDK

  constructor(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    this.sdk = new ClaudeCodeSDK()
    this.setupSocketHandlers()
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('chat', async (data) => {
        try {
          if (data.stream) {
            const stream = this.sdk.streamWithClaudeCode(data.prompt, data.options)
            for await (const chunk of stream) {
              socket.emit('stream', chunk)
            }
            socket.emit('streamEnd')
          } else {
            const response = await this.sdk.executeWithClaudeCode(data.prompt, data.options)
            socket.emit('response', response)
          }
        } catch (error) {
          socket.emit('error', (error as Error).message)
        }
      })

      socket.on('stop', () => {
        this.sdk.stopCurrentProcess()
      })
    })
  }
}

// Convenience exports
export default ClaudeCodeSDK
export { ClaudeCodeSDK as SDK }

// Re-export types
export type { Socket } from 'socket.io-client'