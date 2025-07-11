import type { 
  ProviderId, 
  ProviderConfig, 
  ProviderCapabilities, 
  AuthCredentials, 
  AuthResult, 
  ExecutionRequest, 
  ExecutionResult 
} from './base.js';

// Core provider interface
export interface IProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;

  initialize(config: ProviderConfig): Promise<void>;
  authenticate(credentials: AuthCredentials): Promise<AuthResult>;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  executeStream(request: ExecutionRequest): AsyncGenerator<ExecutionResult>;
  dispose(): Promise<void>;
  isHealthy(): Promise<boolean>;
  getStatus(): Promise<ProviderStatus>;
}

// Provider status
export interface ProviderStatus {
  id: ProviderId;
  healthy: boolean;
  authenticated: boolean;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
  };
}

// Provider factory interface
export interface ProviderFactory {
  create(config: ProviderConfig): Promise<IProvider>;
  supports(providerId: ProviderId): boolean;
  getCapabilities(providerId: ProviderId): ProviderCapabilities;
}

// Provider registry interface
export interface ProviderRegistry {
  register(providerId: ProviderId, factory: ProviderFactory): void;
  unregister(providerId: ProviderId): void;
  get(providerId: ProviderId): ProviderFactory | undefined;
  list(): ProviderId[];
  createProvider(config: ProviderConfig): Promise<IProvider>;
}

// Error classes
export class ProviderError extends Error {
  constructor(
    public readonly providerId: ProviderId,
    message: string,
    public readonly code?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ExecutionError extends ProviderError {
  constructor(providerId: ProviderId, message: string, originalError?: Error) {
    super(providerId, message, 'EXECUTION_ERROR', originalError);
    this.name = 'ExecutionError';
  }
}

export class AuthenticationError extends ProviderError {
  constructor(providerId: ProviderId, message: string, originalError?: Error) {
    super(providerId, message, 'AUTH_ERROR', originalError);
    this.name = 'AuthenticationError';
  }
}

export class TimeoutError extends ProviderError {
  constructor(providerId: ProviderId, timeout: number) {
    super(providerId, `Operation timed out after ${timeout}ms`, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

export class ConfigurationError extends ProviderError {
  constructor(providerId: ProviderId, message: string) {
    super(providerId, message, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}

// Re-export types for convenience
export type { 
  ProviderId, 
  ProviderConfig, 
  ProviderCapabilities, 
  AuthCredentials, 
  AuthResult, 
  ExecutionRequest, 
  ExecutionResult 
};