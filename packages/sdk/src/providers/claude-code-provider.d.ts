import { ProviderId, ProviderConfig, ProviderCapabilities, AuthCredentials, AuthResult, ExecutionRequest, ExecutionResult } from '../types/base';
import { IProvider, ProviderStatus } from '../types/provider';
export declare class ClaudeCodeProvider implements IProvider {
    readonly config: ProviderConfig;
    readonly id: ProviderId;
    readonly name: string;
    readonly capabilities: ProviderCapabilities;
    private process;
    private authenticated;
    private sessionId;
    private metrics;
    constructor(config: ProviderConfig);
    initialize(config: ProviderConfig): Promise<void>;
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;
    execute(request: ExecutionRequest): Promise<ExecutionResult>;
    executeStream(request: ExecutionRequest): AsyncGenerator<ExecutionResult, void, unknown>;
    dispose(): Promise<void>;
    isHealthy(): Promise<boolean>;
    getStatus(): Promise<ProviderStatus>;
    private runClaudeCode;
    private runClaudeCodeStream;
    private updateAverageLatency;
}
