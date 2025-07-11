export * from './types/base';
export * from './types/provider';
export { DefaultProviderRegistry } from './core/provider-registry';
export { DefaultProviderManager } from './core/provider-manager';
export { ClaudeCodeProvider } from './providers/claude-code-provider';
export { ClaudeCodeProviderFactory } from './providers/claude-code-factory';
export { MessageConverter } from './utils/message-converter';
export { AuthHelper } from './utils/auth-helper';
import { DefaultProviderRegistry } from './core/provider-registry';
import { DefaultProviderManager } from './core/provider-manager';
export declare class ClaudeCCSDK {
    private registry;
    private manager;
    constructor();
    private registerDefaultProviders;
    get providers(): DefaultProviderManager;
    get providerRegistry(): DefaultProviderRegistry;
    createClaudeCodeProvider(config?: {
        workspacePath?: string;
        modelId?: string;
        timeout?: number;
    }): Promise<import("./types/provider").IProvider>;
    executeWithClaudeCode(message: string, options?: {
        workspacePath?: string;
        modelId?: string;
        timeout?: number;
    }): Promise<import("./types/base").ExecutionResult>;
}
export default ClaudeCCSDK;
