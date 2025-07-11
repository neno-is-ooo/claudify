import { ClaudeCodeMessage, MessageId, SessionId } from '../types/base';
export declare class MessageConverter {
    static generateId(): MessageId;
    static generateSessionId(): SessionId;
    static createUserMessage(content: string, sessionId: SessionId): ClaudeCodeMessage;
    static createAssistantMessage(content: string, sessionId: SessionId): ClaudeCodeMessage;
    static createErrorMessage(error: string, sessionId: SessionId, code?: string): ClaudeCodeMessage;
    static createInitMessage(sessionId: SessionId, apiKeySource: string, options?: {
        workspacePath?: string;
        modelId?: string;
    }): ClaudeCodeMessage;
    static filterMessages(messages: ClaudeCodeMessage[], types: string[]): ClaudeCodeMessage[];
    static getLastMessage(messages: ClaudeCodeMessage[]): ClaudeCodeMessage | undefined;
    static getMessagesByType(messages: ClaudeCodeMessage[], type: string): ClaudeCodeMessage[];
}
