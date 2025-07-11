/**
 * Base types for the Claude CC SDK
 * 
 * Defines universal interfaces for LLM providers with focus on 
 * Claude Code subscription vs API cost optimization.
 */

// Brand types for better type safety
export type ProviderId = string & { readonly __brand: 'ProviderId' };
export type SessionId = string & { readonly __brand: 'SessionId' };

// LLM Message Types
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: {
    timestamp?: number;
    sessionId?: SessionId;
    providerId?: ProviderId;
  };
}

// LLM Request/Response Types
export interface LLMRequest {
  messages: LLMMessage[];
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    workspacePath?: string;
    timeout?: number;
  };
  metadata?: {
    sessionId?: SessionId;
    userId?: string;
    requestId?: string;
  };
}

export interface LLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  metadata: {
    providerId: ProviderId;
    model: string;
    cost: number; // 0 for subscription, actual cost for API
    duration: number;
    subscriptionUsage?: boolean;
    streaming?: boolean;
    complete?: boolean;
  };
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

// Legacy compatibility types (for existing implementation)
export type ClaudeCodeMessage = 
  | InitMessage 
  | AssistantMessage 
  | UserMessage 
  | ErrorMessage 
  | ResultMessage;

export interface InitMessage {
  type: 'init';
  sessionId: SessionId;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AssistantMessage {
  type: 'assistant' | 'assistant_message';
  content: string;
  sessionId: SessionId;
  timestamp: number;
  metadata?: Record<string, any>;
  id?: string;
}

export interface UserMessage {
  type: 'user' | 'user_message';
  content: string;
  sessionId: SessionId;
  timestamp: number;
  metadata?: Record<string, any>;
  id?: string;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
  sessionId: SessionId;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ResultMessage {
  type: 'result';
  success: boolean;
  messages: ClaudeCodeMessage[];
  metadata: {
    cost_usd?: number;
    api_duration_ms?: number;
    turns?: number;
    model?: string;
    session_id?: SessionId;
  };
  error?: string;
}

// Legacy types for backward compatibility
export interface ExecutionRequest {
  messages: ClaudeCodeMessage[];
  options?: {
    workspacePath?: string;
    modelId?: string;
    timeout?: number;
    // Session continuity options
    continueSession?: boolean;
    sessionId?: string;
    resumeLastSession?: boolean;
  };
}

export interface ExecutionResult {
  success: boolean;
  messages: ClaudeCodeMessage[];
  metadata: {
    cost_usd?: number;
    api_duration_ms?: number;
    turns?: number;
    model?: string;
  };
  error?: string;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  auth?: AuthCredentials;
  timeout?: number;
  metadata?: Record<string, any>;
}

export interface AuthCredentials {
  type: 'none' | 'bearer' | 'api_key';
  token?: string;
  apiKey?: string;
}

export interface AuthResult {
  success: boolean;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  error?: string;
}

// Provider capabilities
export interface ProviderCapabilities {
  streaming: boolean;
  functionCalling: boolean;
  multiModal: boolean;
  tools: string[];
  models: string[];
  authentication: string[];
}

// Utility functions
export function createProviderId(id: string): ProviderId {
  return id as ProviderId;
}

export function createSessionId(): SessionId {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SessionId;
}