"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuvAbstractClaudeCCSDK = exports.AuthHelper = exports.MessageConverter = exports.ClaudeCodeProviderFactory = exports.ClaudeCodeProvider = exports.DefaultProviderManager = exports.DefaultProviderRegistry = void 0;
// Core types and interfaces
__exportStar(require("./types/base"), exports);
__exportStar(require("./types/provider"), exports);
// Core implementation
var provider_registry_1 = require("./core/provider-registry");
Object.defineProperty(exports, "DefaultProviderRegistry", { enumerable: true, get: function () { return provider_registry_1.DefaultProviderRegistry; } });
var provider_manager_1 = require("./core/provider-manager");
Object.defineProperty(exports, "DefaultProviderManager", { enumerable: true, get: function () { return provider_manager_1.DefaultProviderManager; } });
// Claude Code provider
var claude_code_provider_1 = require("./providers/claude-code-provider");
Object.defineProperty(exports, "ClaudeCodeProvider", { enumerable: true, get: function () { return claude_code_provider_1.ClaudeCodeProvider; } });
var claude_code_factory_1 = require("./providers/claude-code-factory");
Object.defineProperty(exports, "ClaudeCodeProviderFactory", { enumerable: true, get: function () { return claude_code_factory_1.ClaudeCodeProviderFactory; } });
// Utilities
var message_converter_1 = require("./utils/message-converter");
Object.defineProperty(exports, "MessageConverter", { enumerable: true, get: function () { return message_converter_1.MessageConverter; } });
var auth_helper_1 = require("./utils/auth-helper");
Object.defineProperty(exports, "AuthHelper", { enumerable: true, get: function () { return auth_helper_1.AuthHelper; } });
// Import the required classes
const provider_registry_2 = require("./core/provider-registry");
const provider_manager_2 = require("./core/provider-manager");
const claude_code_factory_2 = require("./providers/claude-code-factory");
const message_converter_2 = require("./utils/message-converter");
const auth_helper_2 = require("./utils/auth-helper");
// Main SDK class
class RuvAbstractClaudeCCSDK {
    registry;
    manager;
    constructor() {
        this.registry = new provider_registry_2.DefaultProviderRegistry();
        this.manager = new provider_manager_2.DefaultProviderManager(this.registry);
        // Register default providers
        this.registerDefaultProviders();
    }
    registerDefaultProviders() {
        // Register Claude Code provider
        this.registry.register(claude_code_factory_2.ClaudeCodeProviderFactory.getProviderId(), new claude_code_factory_2.ClaudeCodeProviderFactory());
    }
    // Public API
    get providers() {
        return this.manager;
    }
    get providerRegistry() {
        return this.registry;
    }
    async createClaudeCodeProvider(config = {}) {
        const providerConfig = {
            id: claude_code_factory_2.ClaudeCodeProviderFactory.getProviderId(),
            name: 'Claude Code',
            auth: auth_helper_2.AuthHelper.createNoneCredentials(),
            timeout: config.timeout || 30000,
            metadata: {
                workspacePath: config.workspacePath,
                modelId: config.modelId
            }
        };
        return this.manager.addProvider(providerConfig);
    }
    async executeWithClaudeCode(message, options = {}) {
        const providerId = claude_code_factory_2.ClaudeCodeProviderFactory.getProviderId();
        const sessionId = message_converter_2.MessageConverter.generateSessionId();
        const userMessage = message_converter_2.MessageConverter.createUserMessage(message, sessionId);
        const request = {
            messages: [userMessage],
            options: {
                workspacePath: options.workspacePath,
                modelId: options.modelId,
                timeout: options.timeout || 30000
            }
        };
        return this.manager.executeWithProvider(providerId, request);
    }
}
exports.RuvAbstractClaudeCCSDK = RuvAbstractClaudeCCSDK;
// Default export
exports.default = RuvAbstractClaudeCCSDK;
//# sourceMappingURL=index.js.map