import { z } from 'zod';
export type ProviderId = string & {
    readonly __brand: 'ProviderId';
};
export type MessageId = string & {
    readonly __brand: 'MessageId';
};
export type SessionId = string & {
    readonly __brand: 'SessionId';
};
export type TokenId = string & {
    readonly __brand: 'TokenId';
};
export interface BaseMessage {
    id: MessageId;
    type: string;
    sessionId: SessionId;
    timestamp: number;
}
export interface InitMessage extends BaseMessage {
    type: 'init';
    apiKeySource: string;
    workspacePath?: string;
    modelId?: string;
}
export interface AssistantMessage extends BaseMessage {
    type: 'assistant';
    content: string;
    subtype?: string;
    cost_usd?: number;
    api_duration_ms?: number;
    turns?: number;
}
export interface UserMessage extends BaseMessage {
    type: 'user';
    content: string;
    role: 'user';
}
export interface ErrorMessage extends BaseMessage {
    type: 'error';
    error: string;
    code?: string;
    details?: any;
}
export interface ResultMessage extends BaseMessage {
    type: 'result';
    data: any;
    metadata?: Record<string, any>;
}
export type ClaudeCodeMessage = InitMessage | AssistantMessage | UserMessage | ErrorMessage | ResultMessage;
export interface AuthCredentials {
    type: 'bearer' | 'oauth' | 'apikey' | 'none';
    token?: string;
    refreshToken?: string;
    apiKey?: string;
    expiresAt?: number;
}
export interface AuthResult {
    success: boolean;
    token?: string;
    expiresAt?: number;
    error?: string;
}
export interface ProviderConfig {
    id: ProviderId;
    name: string;
    endpoint?: string;
    timeout?: number;
    retryAttempts?: number;
    auth: AuthCredentials;
    metadata?: Record<string, any>;
}
export interface ExecutionRequest {
    messages: ClaudeCodeMessage[];
    options: ExecutionOptions;
}
export interface ExecutionOptions {
    modelId?: string;
    systemPrompt?: string;
    workspacePath?: string;
    timeout?: number;
    disableTools?: string[];
    streaming?: boolean;
    maxTokens?: number;
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
export interface ProviderCapabilities {
    streaming: boolean;
    functionCalling: boolean;
    multiModal: boolean;
    tools: string[];
    models: string[];
    authentication: ('bearer' | 'oauth' | 'apikey' | 'none')[];
}
export declare const ProviderConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    endpoint: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryAttempts: z.ZodOptional<z.ZodNumber>;
    auth: z.ZodObject<{
        type: z.ZodEnum<["bearer", "oauth", "apikey", "none"]>;
        token: z.ZodOptional<z.ZodString>;
        refreshToken: z.ZodOptional<z.ZodString>;
        apiKey: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "bearer" | "oauth" | "apikey" | "none";
        token?: string | undefined;
        refreshToken?: string | undefined;
        apiKey?: string | undefined;
        expiresAt?: number | undefined;
    }, {
        type: "bearer" | "oauth" | "apikey" | "none";
        token?: string | undefined;
        refreshToken?: string | undefined;
        apiKey?: string | undefined;
        expiresAt?: number | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    auth: {
        type: "bearer" | "oauth" | "apikey" | "none";
        token?: string | undefined;
        refreshToken?: string | undefined;
        apiKey?: string | undefined;
        expiresAt?: number | undefined;
    };
    endpoint?: string | undefined;
    timeout?: number | undefined;
    retryAttempts?: number | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    name: string;
    auth: {
        type: "bearer" | "oauth" | "apikey" | "none";
        token?: string | undefined;
        refreshToken?: string | undefined;
        apiKey?: string | undefined;
        expiresAt?: number | undefined;
    };
    endpoint?: string | undefined;
    timeout?: number | undefined;
    retryAttempts?: number | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const ExecutionRequestSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        sessionId: z.ZodString;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        sessionId: string;
        timestamp: number;
    }, {
        id: string;
        type: string;
        sessionId: string;
        timestamp: number;
    }>, "many">;
    options: z.ZodObject<{
        modelId: z.ZodOptional<z.ZodString>;
        systemPrompt: z.ZodOptional<z.ZodString>;
        workspacePath: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        disableTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        streaming: z.ZodOptional<z.ZodBoolean>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeout?: number | undefined;
        modelId?: string | undefined;
        systemPrompt?: string | undefined;
        workspacePath?: string | undefined;
        disableTools?: string[] | undefined;
        streaming?: boolean | undefined;
        maxTokens?: number | undefined;
    }, {
        timeout?: number | undefined;
        modelId?: string | undefined;
        systemPrompt?: string | undefined;
        workspacePath?: string | undefined;
        disableTools?: string[] | undefined;
        streaming?: boolean | undefined;
        maxTokens?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    options: {
        timeout?: number | undefined;
        modelId?: string | undefined;
        systemPrompt?: string | undefined;
        workspacePath?: string | undefined;
        disableTools?: string[] | undefined;
        streaming?: boolean | undefined;
        maxTokens?: number | undefined;
    };
    messages: {
        id: string;
        type: string;
        sessionId: string;
        timestamp: number;
    }[];
}, {
    options: {
        timeout?: number | undefined;
        modelId?: string | undefined;
        systemPrompt?: string | undefined;
        workspacePath?: string | undefined;
        disableTools?: string[] | undefined;
        streaming?: boolean | undefined;
        maxTokens?: number | undefined;
    };
    messages: {
        id: string;
        type: string;
        sessionId: string;
        timestamp: number;
    }[];
}>;
