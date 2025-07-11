"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionRequestSchema = exports.ProviderConfigSchema = void 0;
const zod_1 = require("zod");
// Validation schemas
exports.ProviderConfigSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    endpoint: zod_1.z.string().optional(),
    timeout: zod_1.z.number().optional(),
    retryAttempts: zod_1.z.number().optional(),
    auth: zod_1.z.object({
        type: zod_1.z.enum(['bearer', 'oauth', 'apikey', 'none']),
        token: zod_1.z.string().optional(),
        refreshToken: zod_1.z.string().optional(),
        apiKey: zod_1.z.string().optional(),
        expiresAt: zod_1.z.number().optional(),
    }),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ExecutionRequestSchema = zod_1.z.object({
    messages: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.string(),
        sessionId: zod_1.z.string(),
        timestamp: zod_1.z.number(),
    })),
    options: zod_1.z.object({
        modelId: zod_1.z.string().optional(),
        systemPrompt: zod_1.z.string().optional(),
        workspacePath: zod_1.z.string().optional(),
        timeout: zod_1.z.number().optional(),
        disableTools: zod_1.z.array(zod_1.z.string()).optional(),
        streaming: zod_1.z.boolean().optional(),
        maxTokens: zod_1.z.number().optional(),
    }),
});
//# sourceMappingURL=base.js.map