"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeCodeProviderFactory = void 0;
const claude_code_provider_1 = require("./claude-code-provider");
class ClaudeCodeProviderFactory {
    static PROVIDER_ID = 'claude-code';
    static CAPABILITIES = {
        streaming: true,
        functionCalling: true,
        multiModal: true,
        tools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'Task', 'TodoWrite'],
        models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
        authentication: ['none', 'bearer']
    };
    async create(config) {
        return new claude_code_provider_1.ClaudeCodeProvider(config);
    }
    supports(providerId) {
        return providerId === ClaudeCodeProviderFactory.PROVIDER_ID;
    }
    getCapabilities(providerId) {
        if (!this.supports(providerId)) {
            throw new Error(`Provider ${providerId} not supported`);
        }
        return ClaudeCodeProviderFactory.CAPABILITIES;
    }
    static getProviderId() {
        return ClaudeCodeProviderFactory.PROVIDER_ID;
    }
}
exports.ClaudeCodeProviderFactory = ClaudeCodeProviderFactory;
//# sourceMappingURL=claude-code-factory.js.map