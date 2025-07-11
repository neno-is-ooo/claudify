import { ClaudeCodeMessage, SessionId } from '../types/base.js';

export type MessageId = string & { readonly __brand: 'MessageId' };

export class MessageConverter {
  static createUserMessage(content: string, sessionId: SessionId): ClaudeCodeMessage {
    return {
      id: MessageConverter.generateId(),
      type: 'user',
      content,
      sessionId,
      timestamp: Date.now()
    };
  }

  static createAssistantMessage(content: string, sessionId: SessionId): ClaudeCodeMessage {
    return {
      id: MessageConverter.generateId(),
      type: 'assistant',
      content,
      sessionId,
      timestamp: Date.now()
    };
  }

  static createErrorMessage(error: string, sessionId: SessionId): ClaudeCodeMessage {
    return {
      type: 'error',
      error,
      sessionId,
      timestamp: Date.now()
    };
  }

  static createInitMessage(sessionId: SessionId, metadata?: Record<string, any>): ClaudeCodeMessage {
    return {
      type: 'init',
      sessionId,
      timestamp: Date.now(),
      metadata
    };
  }

  static filterMessages(messages: ClaudeCodeMessage[], types: string[]): ClaudeCodeMessage[] {
    return messages.filter(msg => types.includes(msg.type));
  }

  static getLastMessage(messages: ClaudeCodeMessage[]): ClaudeCodeMessage | undefined {
    return messages[messages.length - 1];
  }

  static generateSessionId(): SessionId {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SessionId;
  }

  static generateId(): MessageId {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as MessageId;
  }
}