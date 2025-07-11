import { ProviderId, ProviderConfig, ProviderCapabilities, AuthCredentials, AuthResult, ExecutionRequest, ExecutionResult } from './base';
export interface IProvider {
    readonly id: ProviderId;
    readonly name: string;
    readonly capabilities: ProviderCapabilities;
    readonly config: ProviderConfig;
    initialize(config: ProviderConfig): Promise<void>;
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;
    execute(request: ExecutionRequest): Promise<ExecutionResult>;
    executeStream(request: ExecutionRequest): AsyncGenerator<ExecutionResult, void, unknown>;
    dispose(): Promise<void>;
    isHealthy(): Promise<boolean>;
    getStatus(): Promise<ProviderStatus>;
}
export interface ProviderStatus {
    id: ProviderId;
    healthy: boolean;
    authenticated: boolean;
    lastUsed?: number;
    metrics: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
    };
}
export interface ProviderFactory {
    create(config: ProviderConfig): Promise<IProvider>;
    supports(providerId: ProviderId): boolean;
    getCapabilities(providerId: ProviderId): ProviderCapabilities;
}
export interface ProviderRegistry {
    register(providerId: ProviderId, factory: ProviderFactory): void;
    unregister(providerId: ProviderId): void;
    get(providerId: ProviderId): ProviderFactory | undefined;
    list(): ProviderId[];
    createProvider(config: ProviderConfig): Promise<IProvider>;
}
export interface ProviderManager {
    addProvider(config: ProviderConfig): Promise<IProvider>;
    removeProvider(providerId: ProviderId): Promise<void>;
    getProvider(providerId: ProviderId): IProvider | undefined;
    listProviders(): IProvider[];
    executeWithProvider(providerId: ProviderId, request: ExecutionRequest): Promise<ExecutionResult>;
    executeWithBest(request: ExecutionRequest): Promise<ExecutionResult>;
}
export declare class ProviderError extends Error {
    readonly providerId: ProviderId;
    readonly code?: string | undefined;
    readonly originalError?: Error | undefined;
    constructor(providerId: ProviderId, message: string, code?: string | undefined, originalError?: Error | undefined);
}
export declare class AuthenticationError extends ProviderError {
    constructor(providerId: ProviderId, message: string, originalError?: Error);
}
export declare class ExecutionError extends ProviderError {
    constructor(providerId: ProviderId, message: string, originalError?: Error);
}
export declare class TimeoutError extends ProviderError {
    constructor(providerId: ProviderId, timeout: number, originalError?: Error);
}
export declare class ConfigurationError extends ProviderError {
    constructor(providerId: ProviderId, message: string, originalError?: Error);
}
