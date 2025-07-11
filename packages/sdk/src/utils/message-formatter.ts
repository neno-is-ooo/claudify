import { ClaudeCodeMessage } from '../types/base.js';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: { timestamp: number };
}

export interface ConversationContext {
  systemPrompt?: string;
  workspacePath?: string;
  task?: string;
}

export class ClaudeCodeMessageFormatter {
  /**
   * Format a conversation history into Claude Code input format
   */
  formatConversation(messages: Message[], context?: ConversationContext): string {
    // For batch processing with --print flag, we send just the user's prompt
    // Claude CLI maintains its own conversation context
    
    // Find the last user message - this is our prompt
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (!lastUserMessage) {
      return '';
    }
    
    // Return the user's prompt directly for batch processing
    return lastUserMessage.content;
  }

  /**
   * Format a single message for Claude Code
   */
  formatMessage(message: Message): string {
    const role = this.formatRole(message.role);
    return `${role}: ${message.content}`;
  }

  /**
   * Convert standard message roles to Claude Code format
   */
  private formatRole(role: string): string {
    switch (role.toLowerCase()) {
      case 'user':
        return 'Human';
      case 'assistant':
        return 'Assistant';
      case 'system':
        return 'System';
      default:
        return 'Human';
    }
  }

  /**
   * Create a system prompt for Claude Code
   */
  createSystemPrompt(instructions: string): string {
    return `You are Claude Code, an AI assistant that helps with coding tasks. ${instructions}`;
  }

  /**
   * Format messages from Claude Code internal format to standard format
   */
  convertFromClaudeCodeMessages(messages: ClaudeCodeMessage[]): Message[] {
    return messages
      .filter(msg => 
        msg.type === 'user_message' || msg.type === 'assistant_message' || 
        msg.type === 'user' || msg.type === 'assistant'
      )
      .map(msg => ({
        role: (msg.type === 'user_message' || msg.type === 'user') ? 'user' as const : 'assistant' as const,
        content: 'content' in msg ? msg.content || '' : ''
      }));
  }

  /**
   * Convert standard messages to Claude Code internal format
   */
  convertToClaudeCodeMessages(messages: Message[]): ClaudeCodeMessage[] {
    const sessionId = `session_${Date.now()}` as any;
    return messages.map((msg, index) => ({
      id: `msg_${index}`,
      type: msg.role === 'user' ? 'user_message' as const : 'assistant_message' as const,
      content: msg.content,
      sessionId,
      timestamp: Date.now()
    }));
  }

  /**
   * Extract the last assistant message from a conversation
   */
  extractLastAssistantMessage(messages: Message[]): string | null {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i].content;
      }
    }
    return null;
  }

  /**
   * Add contextual prompts to enhance Claude Code responses
   */
  addContextualPrompts(messages: Message[], context?: ConversationContext): Message[] {
    const contextualMessages: Message[] = [];
    
    // Add system context if provided
    if (context?.systemPrompt) {
      contextualMessages.push({
        role: 'system',
        content: context.systemPrompt
      });
    }
    
    // Add workspace context
    if (context?.workspacePath) {
      contextualMessages.push({
        role: 'system',
        content: `You are working in the directory: ${context.workspacePath}. Please consider the project structure and existing files when providing responses.`
      });
    }
    
    // Add task context
    if (context?.task) {
      contextualMessages.push({
        role: 'system',
        content: `Current task: ${context.task}`
      });
    }
    
    return [...contextualMessages, ...messages];
  }

  /**
   * Validate message format for Claude Code compatibility
   */
  validateMessages(messages: Message[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(messages)) {
      errors.push('Messages must be an array');
      return { valid: false, errors };
    }
    
    if (messages.length === 0) {
      errors.push('At least one message is required');
      return { valid: false, errors };
    }
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
        errors.push(`Message ${i}: Invalid role "${message.role}"`);
      }
      
      if (!message.content || typeof message.content !== 'string') {
        errors.push(`Message ${i}: Content must be a non-empty string`);
      }
      
      if (message.content && message.content.length > 100000) {
        errors.push(`Message ${i}: Content exceeds maximum length of 100,000 characters`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
}