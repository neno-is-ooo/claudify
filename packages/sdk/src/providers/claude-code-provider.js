"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeCodeProvider = void 0;
const child_process_1 = require("child_process");
const provider_1 = require("../types/provider");
class ClaudeCodeProvider {
    config;
    id;
    name = 'Claude Code';
    capabilities = {
        streaming: true,
        functionCalling: true,
        multiModal: true,
        tools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
        models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
        authentication: ['none', 'bearer']
    };
    process = null;
    authenticated = false;
    sessionId = null;
    metrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0
    };
    constructor(config) {
        this.config = config;
        this.id = config.id;
    }
    async initialize(config) {
        // Claude Code doesn't require explicit initialization
        // It uses the existing Claude CLI authentication
    }
    async authenticate(credentials) {
        if (credentials.type === 'none') {
            // Claude Code uses CLI authentication
            this.authenticated = true;
            return { success: true };
        }
        return { success: false, error: 'Claude Code only supports CLI authentication' };
    }
    async execute(request) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        try {
            const result = await this.runClaudeCode(request);
            this.metrics.successfulRequests++;
            this.updateAverageLatency(Date.now() - startTime);
            return result;
        }
        catch (error) {
            this.metrics.failedRequests++;
            if (error instanceof Error) {
                throw new provider_1.ExecutionError(this.id, error.message, error);
            }
            throw new provider_1.ExecutionError(this.id, 'Unknown execution error');
        }
    }
    async *executeStream(request) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        try {
            for await (const result of this.runClaudeCodeStream(request)) {
                yield result;
            }
            this.metrics.successfulRequests++;
            this.updateAverageLatency(Date.now() - startTime);
        }
        catch (error) {
            this.metrics.failedRequests++;
            if (error instanceof Error) {
                throw new provider_1.ExecutionError(this.id, error.message, error);
            }
            throw new provider_1.ExecutionError(this.id, 'Unknown execution error');
        }
    }
    async dispose() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
    async isHealthy() {
        try {
            // Simple health check - verify claude command is available
            const process = (0, child_process_1.spawn)('claude', ['--version'], { stdio: 'pipe' });
            return new Promise((resolve) => {
                process.on('exit', (code) => {
                    resolve(code === 0);
                });
                process.on('error', () => {
                    resolve(false);
                });
                // Timeout after 5 seconds
                setTimeout(() => resolve(false), 5000);
            });
        }
        catch {
            return false;
        }
    }
    async getStatus() {
        return {
            id: this.id,
            healthy: await this.isHealthy(),
            authenticated: this.authenticated,
            metrics: this.metrics
        };
    }
    async runClaudeCode(request) {
        const { messages, options } = request;
        // Build claude command arguments
        const args = ['code'];
        if (options.workspacePath) {
            args.push('--workspace', options.workspacePath);
        }
        if (options.modelId) {
            args.push('--model', options.modelId);
        }
        // Create the process
        this.process = (0, child_process_1.spawn)('claude', args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: options.workspacePath || process.cwd()
        });
        if (!this.process.stdin || !this.process.stdout) {
            throw new provider_1.ExecutionError(this.id, 'Failed to create Claude process');
        }
        // Send messages to stdin
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.type === 'user') {
            this.process.stdin.write(lastMessage.content);
            this.process.stdin.end();
        }
        // Collect output
        const chunks = [];
        const responseMessages = [];
        return new Promise((resolve, reject) => {
            if (!this.process || !this.process.stdout) {
                reject(new provider_1.ExecutionError(this.id, 'Process not initialized'));
                return;
            }
            // Handle timeout
            const timeout = options.timeout || 30000;
            const timeoutHandle = setTimeout(() => {
                if (this.process) {
                    this.process.kill();
                }
                reject(new provider_1.TimeoutError(this.id, timeout));
            }, timeout);
            this.process.stdout.on('data', (chunk) => {
                chunks.push(chunk.toString());
            });
            this.process.on('exit', (code) => {
                clearTimeout(timeoutHandle);
                if (code !== 0) {
                    reject(new provider_1.ExecutionError(this.id, `Claude process exited with code ${code}`));
                    return;
                }
                const output = chunks.join('');
                // Parse response as assistant message
                const assistantMessage = {
                    id: `msg_${Date.now()}`,
                    type: 'assistant',
                    sessionId: this.sessionId || `session_${Date.now()}`,
                    timestamp: Date.now(),
                    content: output
                };
                responseMessages.push(assistantMessage);
                resolve({
                    success: true,
                    messages: responseMessages,
                    metadata: {
                        api_duration_ms: Date.now() - Date.now(),
                        turns: 1,
                        model: options.modelId
                    }
                });
            });
            this.process.on('error', (error) => {
                clearTimeout(timeoutHandle);
                reject(new provider_1.ExecutionError(this.id, error.message, error));
            });
        });
    }
    async *runClaudeCodeStream(request) {
        // For now, just yield the complete result
        // In a real implementation, this would stream partial results
        const result = await this.runClaudeCode(request);
        yield result;
    }
    updateAverageLatency(latency) {
        const total = this.metrics.totalRequests;
        this.metrics.averageLatency =
            (this.metrics.averageLatency * (total - 1) + latency) / total;
    }
}
exports.ClaudeCodeProvider = ClaudeCodeProvider;
//# sourceMappingURL=claude-code-provider.js.map