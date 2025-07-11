import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ConversationStore } from './conversation-store';

// Import from SDK workspace package
import { ClaudeCodeSDK, MessageConverter } from '@claude-cc/sdk';
type ExecutionResult = any;
type SessionId = any;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

// Initialize SDK and conversation store
const sdk = new ClaudeCodeSDK();
const conversationStore = new ConversationStore('./conversations');

// Store active sessions and their conversation IDs
const sessions = new Map<string, { sessionId: SessionId; conversationId: string }>();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Conversation management endpoints
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await conversationStore.getAllConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await conversationStore.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  try {
    await conversationStore.deleteConversation(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

app.get('/api/conversations/:id/export', async (req, res) => {
  try {
    const format = (req.query.format as 'json' | 'markdown' | 'api-json') || 'json';
    const content = await conversationStore.exportConversation(req.params.id, format);
    
    const filename = `conversation-${req.params.id}.${format === 'api-json' || format === 'json' ? 'json' : 'md'}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'markdown' ? 'text/markdown' : 'application/json');
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export conversation' });
  }
});

app.post('/api/conversations/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const results = await conversationStore.searchConversations(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search conversations' });
  }
});

// Create conversation from existing context
app.post('/api/conversations/:id/use-as-context', async (req, res) => {
  try {
    const { title } = req.body;
    const newConversation = await conversationStore.createConversationFromContext(
      title || `Context from conversation`,
      req.params.id
    );
    res.json(newConversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation from context' });
  }
});

// Chat endpoint for REST API
app.post('/api/chat', async (req, res) => {
  const { message, sessionId, modelId = 'sonnet' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Validate model
  const validModels = ['sonnet', 'opus'];
  const selectedModel = validModels.includes(modelId) ? modelId : 'sonnet';

  try {
    console.log(`[API] Processing message: "${message}" (model: ${selectedModel})`);
    
    const result = await sdk.executeWithClaudeCode(message, {
      workspacePath: process.cwd(),
      modelId: selectedModel,
      timeout: 60000
    });

    res.json(result);
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// WebSocket connection for real-time chat
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  
  // Generate session ID for this connection
  const sessionId = MessageConverter.generateSessionId();
  let currentConversationId: string | null = null;
  
  // Send welcome message
  socket.emit('connected', { 
    sessionId,
    message: 'Connected to Claude Code chat server'
  });

  // Handle creating/loading conversation
  socket.on('conversation:create', async (data: { title?: string }) => {
    try {
      const conversation = await conversationStore.createConversation(data.title);
      currentConversationId = conversation.id;
      sessions.set(socket.id, { sessionId, conversationId: conversation.id });
      socket.emit('conversation:created', conversation);
    } catch (error) {
      socket.emit('error', { error: 'Failed to create conversation' });
    }
  });

  socket.on('conversation:load', async (data: { conversationId: string }) => {
    try {
      const conversation = await conversationStore.getConversation(data.conversationId);
      if (conversation) {
        currentConversationId = conversation.id;
        sessions.set(socket.id, { sessionId, conversationId: conversation.id });
        socket.emit('conversation:loaded', conversation);
      } else {
        socket.emit('error', { error: 'Conversation not found' });
      }
    } catch (error) {
      socket.emit('error', { error: 'Failed to load conversation' });
    }
  });

  // Handle chat messages
  socket.on('message', async (data: { message: string; modelId?: string; sessionContinuity?: boolean; streaming?: boolean }) => {
    const { message, modelId = 'sonnet', sessionContinuity = true, streaming = false } = data;
    
    if (!message) {
      socket.emit('error', { error: 'Message is required' });
      return;
    }

    // Validate model
    const validModels = ['sonnet', 'opus'];
    const selectedModel = validModels.includes(modelId) ? modelId : 'sonnet';

    try {
      console.log(`[WS] Processing message from ${socket.id}: "${message}" (model: ${selectedModel})`);
      
      // Create conversation if needed
      if (!currentConversationId) {
        const conversation = await conversationStore.createConversation();
        currentConversationId = conversation.id;
        sessions.set(socket.id, { sessionId, conversationId: conversation.id });
        socket.emit('conversation:created', conversation);
      }
      
      // Add user message to conversation
      await conversationStore.addMessage(currentConversationId, {
        id: uuidv4(),
        type: 'user',
        content: message,
        timestamp: Date.now(),
        modelId: selectedModel
      });
      
      // Send thinking status with model info
      socket.emit('thinking', { 
        status: `Claude ${selectedModel === 'opus' ? 'Opus' : 'Sonnet'} is thinking...` 
      });
      
      const startTime = Date.now();
      
      if (streaming) {
        // Use streaming execution for real-time response
        let streamedContent = '';
        let chunkCount = 0;
        
        try {
          for await (const chunk of sdk.executeStreamingWithClaudeCode(message, {
            workspacePath: process.cwd(),
            modelId: selectedModel,
            timeout: 60000,
            continueSession: sessionContinuity,
            sessionId: currentConversationId
          })) {
            streamedContent += chunk;
            chunkCount++;
            
            // Send streaming chunks to client
            socket.emit('stream', {
              chunk,
              totalLength: streamedContent.length,
              chunkIndex: chunkCount
            });
            
            // Optional: throttle for better UX
            if (chunkCount % 5 === 0) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          const duration = Date.now() - startTime;
          
          // Create mock result for compatibility
          const result = {
            success: true,
            messages: [{
              id: `msg_${Date.now()}`,
              type: 'assistant_message',
              sessionId: currentConversationId,
              timestamp: Date.now(),
              content: streamedContent
            }],
            metadata: {
              api_duration_ms: duration,
              turns: 1,
              model: selectedModel,
              streaming: true,
              chunks: chunkCount
            }
          };
          
          // Add assistant response to conversation with full API data
          if (result.success && result.messages && result.messages.length > 0) {
            const assistantMessage = result.messages[result.messages.length - 1];
            const assistantMessageId = uuidv4();
            
            await conversationStore.addMessage(currentConversationId, {
              id: assistantMessageId,
              type: 'assistant',
              content: assistantMessage.content || 'No response',
              timestamp: Date.now(),
              duration,
              modelId: selectedModel,
              rawExecutionResult: result,
              apiCallData: {
                request: {
                  message,
                  modelId: selectedModel,
                  workspacePath: process.cwd(),
                  timeout: 60000,
                  streaming: true
                },
                response: result,
                metadata: {
                  duration,
                  startTime,
                  endTime: Date.now(),
                  socketId: socket.id,
                  sessionId,
                  streaming: true,
                  chunks: chunkCount
                }
              }
            });
          }
          
          // Send final response
          socket.emit('response', {
            ...result,
            duration,
            conversationId: currentConversationId,
            streaming: true
          });
          
        } catch (error) {
          console.error(`[WS] Streaming error for ${socket.id}:`, error);
          socket.emit('error', { 
            error: 'Failed to process streaming message',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        // Execute with Claude Code with configurable session continuity (non-streaming)
        const result = await sdk.executeWithClaudeCode(message, {
          workspacePath: process.cwd(),
          modelId: selectedModel,
          timeout: 60000,
          continueSession: sessionContinuity, // Use client setting
          sessionId: currentConversationId // Use conversation ID as session ID
        });

        const duration = Date.now() - startTime;
        
        // Add assistant response to conversation with full API data
        if (result.success && result.messages && result.messages.length > 0) {
          const assistantMessage = result.messages[result.messages.length - 1];
          const assistantMessageId = uuidv4();
          
          await conversationStore.addMessage(currentConversationId, {
            id: assistantMessageId,
            type: 'assistant',
            content: assistantMessage.content || 'No response',
            timestamp: Date.now(),
            duration,
            modelId: selectedModel,
            rawExecutionResult: result,
            apiCallData: {
              request: {
                message,
                modelId: selectedModel,
                workspacePath: process.cwd(),
                timeout: 60000
              },
              response: result,
              metadata: {
                duration,
                startTime,
                endTime: Date.now(),
                socketId: socket.id,
                sessionId
              }
            }
          });
        }
        
        // Send response
        socket.emit('response', {
          ...result,
          duration,
          conversationId: currentConversationId
        });
      }
      
    } catch (error) {
      console.error(`[WS] Error for ${socket.id}:`, error);
      socket.emit('error', { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
    sessions.delete(socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Claude Code chat server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔧 REST API available at http://localhost:${PORT}/api`);
});