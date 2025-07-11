import { 
  ProviderId, 
  ProviderConfig, 
  ProviderCapabilities, 
  AuthCredentials, 
  AuthResult, 
  ExecutionRequest, 
  ExecutionResult,
  ClaudeCodeMessage,
  SessionId 
} from '../types/base.js';
import { 
  IProvider, 
  ProviderStatus, 
  AuthenticationError, 
  ExecutionError, 
  TimeoutError 
} from '../types/provider.js';
import { ClaudeCodeProcessManager, ClaudeCodeOptions } from '../core/process-manager.js';
import { ClaudeCodeMessageFormatter, Message } from '../utils/message-formatter.js';
import { ClaudeCodeResponseParser, LLMResponse } from '../utils/response-parser.js';

export class ClaudeCodeProvider implements IProvider {
  readonly id: ProviderId;
  readonly name: string = 'Claude Code';
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    functionCalling: true,
    multiModal: true,
    tools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    authentication: ['none', 'bearer']
  };

  private authenticated = false;
  private sessionId: SessionId | null = null;
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0
  };

  private readonly processManager: ClaudeCodeProcessManager;
  private readonly messageFormatter: ClaudeCodeMessageFormatter;
  private readonly responseParser: ClaudeCodeResponseParser;

  constructor(public readonly config: ProviderConfig) {
    this.id = config.id;
    this.processManager = new ClaudeCodeProcessManager();
    this.messageFormatter = new ClaudeCodeMessageFormatter();
    this.responseParser = new ClaudeCodeResponseParser();
  }

  async initialize(config: ProviderConfig): Promise<void> {
    // Check if we're running inside Claude Code (detected by specific env vars)
    const isInsideClaudeCode = process.env.CLAUDE_CODE_SESSION === 'true' || process.env.CLAUDE_CODE_MOCK === 'true';
    
    if (isInsideClaudeCode) {
      console.log('🔍 Mock mode enabled (CLAUDE_CODE_MOCK=true)');
      return; // Skip CLI check when in mock mode
    }
    
    // Verify Claude Code is available
    const isAvailable = await this.processManager.isClaudeCodeAvailable();
    if (!isAvailable) {
      throw new ExecutionError(this.id, 'Claude Code CLI not found. Please install and authenticate with Claude CLI.');
    }
  }

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    if (credentials.type === 'none') {
      // Claude Code uses CLI authentication - verify it's working
      const isHealthy = await this.isHealthy();
      if (isHealthy) {
        this.authenticated = true;
        return { success: true };
      } else {
        return { success: false, error: 'Claude CLI not authenticated. Run "claude auth login"' };
      }
    }

    return { success: false, error: 'Claude Code only supports CLI authentication' };
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const result = await this.executeBatchRequest(request);
      
      this.metrics.successfulRequests++;
      this.updateAverageLatency(Date.now() - startTime);
      
      return result;
    } catch (error) {
      this.metrics.failedRequests++;
      
      if (error instanceof Error) {
        throw new ExecutionError(this.id, error.message, error);
      }
      
      throw new ExecutionError(this.id, 'Unknown execution error');
    }
  }

  async *executeStream(request: ExecutionRequest): AsyncGenerator<ExecutionResult, void, unknown> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      for await (const result of this.executeStreamingRequest(request)) {
        yield result;
      }
      
      this.metrics.successfulRequests++;
      this.updateAverageLatency(Date.now() - startTime);
    } catch (error) {
      this.metrics.failedRequests++;
      
      if (error instanceof Error) {
        throw new ExecutionError(this.id, error.message, error);
      }
      
      throw new ExecutionError(this.id, 'Unknown execution error');
    }
  }

  async dispose(): Promise<void> {
    // No persistent processes to clean up in batch mode
    // Each request creates and terminates its own process
  }

  async isHealthy(): Promise<boolean> {
    // Check if we're in mock mode
    const isInsideClaudeCode = process.env.CLAUDE_CODE_SESSION === 'true' || process.env.CLAUDE_CODE_MOCK === 'true';
    if (isInsideClaudeCode) {
      return true; // Always healthy in mock mode
    }
    
    try {
      return await this.processManager.isClaudeCodeAvailable();
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    return {
      id: this.id,
      healthy: await this.isHealthy(),
      authenticated: this.authenticated,
      metrics: this.metrics
    };
  }

  /**
   * Execute a batch request using the headless LLM provider pattern
   */
  private async executeBatchRequest(request: ExecutionRequest): Promise<ExecutionResult> {
    const { messages, options = {} } = request;
    const startTime = Date.now();
    
    // Check if we're in mock mode
    const isInsideClaudeCode = process.env.CLAUDE_CODE_SESSION === 'true' || process.env.CLAUDE_CODE_MOCK === 'true';
    
    if (isInsideClaudeCode) {
      // Return a mock response for demo purposes
      const lastUserMessage = messages.filter(m => m.type === 'user' || m.type === 'user_message').pop();
      const userContent = lastUserMessage && 'content' in lastUserMessage ? lastUserMessage.content : 'nothing';
      const mockResponse = `I'm the Claude Code SDK running in mock mode! You said: "${userContent}"`;
      
      return {
        success: true,
        messages: [{
          id: `msg_${Date.now()}` as any,
          type: 'assistant_message',
          sessionId: this.sessionId || (`session_${Date.now()}` as any),
          timestamp: Date.now(),
          content: mockResponse
        }],
        metadata: {
          api_duration_ms: Date.now() - startTime,
          turns: 1,
          model: options.modelId || 'mock-mode'
        }
      };
    }
    
    // Convert Claude Code messages to standard format
    const standardMessages: Message[] = this.messageFormatter.convertFromClaudeCodeMessages(messages);
    
    // Format conversation for Claude Code input
    const conversationInput = this.messageFormatter.formatConversation(standardMessages, {
      workspacePath: options.workspacePath,
      task: 'Respond to the user\'s request as Claude Code'
    });
    
    // Configure process options with session continuity support
    const processOptions: ClaudeCodeOptions = {
      workspacePath: options.workspacePath,
      modelId: options.modelId,
      timeout: options.timeout || 30000,
      jsonOutput: false, // We'll parse text output for now
      continueSession: options.continueSession,
      sessionId: options.sessionId,
      resumeLastSession: options.resumeLastSession
    };
    
    // Execute the process with appropriate method based on session continuity
    let processResult;
    if (options.resumeLastSession) {
      // Use resume method for --continue functionality
      processResult = await this.processManager.resumeLastSession(
        options.workspacePath || process.cwd(),
        options.modelId
      );
    } else if (options.continueSession) {
      // Use continuity method for session preservation
      processResult = await this.processManager.executeWithContinuity(processOptions, conversationInput);
    } else {
      // Standard batch processing
      processResult = await this.processManager.executeProcess(processOptions, conversationInput);
    }
    
    if (!processResult.success) {
      throw new ExecutionError(
        this.id, 
        `Claude Code execution failed: ${processResult.stderr}`,
        new Error(`Exit code: ${processResult.exitCode}, Signal: ${processResult.signal}`)
      );
    }
    
    // Parse the response
    const llmResponse = await this.responseParser.parseResponse(processResult.stdout);
    
    // Convert back to Claude Code message format
    const responseMessage: ClaudeCodeMessage = {
      id: `msg_${Date.now()}` as any,
      type: 'assistant_message',
      sessionId: this.sessionId || (`session_${Date.now()}` as any),
      timestamp: Date.now(),
      content: llmResponse.content
    };
    
    return {
      success: true,
      messages: [responseMessage],
      metadata: {
        api_duration_ms: Date.now() - startTime,
        turns: 1,
        model: options.modelId,
        cost_usd: llmResponse.metadata?.cost_usd
      }
    };
  }

  /**
   * Execute a streaming request using the headless LLM provider pattern
   */
  private async *executeStreamingRequest(request: ExecutionRequest): AsyncGenerator<ExecutionResult, void, unknown> {
    const { messages, options = {} } = request;
    const startTime = Date.now();
    
    // Convert Claude Code messages to standard format
    const standardMessages: Message[] = this.messageFormatter.convertFromClaudeCodeMessages(messages);
    
    // Format conversation for Claude Code input
    const conversationInput = this.messageFormatter.formatConversation(standardMessages, {
      workspacePath: options.workspacePath,
      task: 'Respond to the user\'s request as Claude Code'
    });
    
    // Configure process options
    const processOptions: ClaudeCodeOptions = {
      workspacePath: options.workspacePath,
      modelId: options.modelId,
      timeout: options.timeout || 30000,
      jsonOutput: false
    };
    
    // Execute streaming process
    const streamingOutput = this.processManager.executeProcessStream(processOptions, conversationInput);
    
    let accumulatedContent = '';
    
    try {
      for await (const chunk of streamingOutput) {
        accumulatedContent += chunk;
        
        // Parse each chunk and yield incremental results
        const responseMessage: ClaudeCodeMessage = {
          id: `msg_${Date.now()}` as any,
          type: 'assistant_message',
          sessionId: this.sessionId || (`session_${Date.now()}` as any),
          timestamp: Date.now(),
          content: accumulatedContent
        };
        
        yield {
          success: true,
          messages: [responseMessage],
          metadata: {
            api_duration_ms: Date.now() - startTime,
            turns: 1,
            model: options.modelId
          }
        };
      }
    } catch (error) {
      throw new ExecutionError(
        this.id,
        `Claude Code streaming failed: ${error}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private updateAverageLatency(latency: number): void {
    const total = this.metrics.totalRequests;
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (total - 1) + latency) / total;
  }
}