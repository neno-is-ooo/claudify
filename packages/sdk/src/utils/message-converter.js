"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageConverter = void 0;
class MessageConverter {
    static generateId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static createUserMessage(content, sessionId) {
        return {
            id: MessageConverter.generateId(),
            type: 'user',
            sessionId,
            timestamp: Date.now(),
            content,
            role: 'user'
        };
    }
    static createAssistantMessage(content, sessionId) {
        return {
            id: MessageConverter.generateId(),
            type: 'assistant',
            sessionId,
            timestamp: Date.now(),
            content
        };
    }
    static createErrorMessage(error, sessionId, code) {
        return {
            id: MessageConverter.generateId(),
            type: 'error',
            sessionId,
            timestamp: Date.now(),
            error,
            code
        };
    }
    static createInitMessage(sessionId, apiKeySource, options = {}) {
        return {
            id: MessageConverter.generateId(),
            type: 'init',
            sessionId,
            timestamp: Date.now(),
            apiKeySource,
            ...options
        };
    }
    static filterMessages(messages, types) {
        return messages.filter(msg => types.includes(msg.type));
    }
    static getLastMessage(messages) {
        return messages[messages.length - 1];
    }
    static getMessagesByType(messages, type) {
        return messages.filter(msg => msg.type === type);
    }
}
exports.MessageConverter = MessageConverter;
//# sourceMappingURL=message-converter.js.map