"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.TimeoutError = exports.ExecutionError = exports.AuthenticationError = exports.ProviderError = void 0;
// Error types
class ProviderError extends Error {
    providerId;
    code;
    originalError;
    constructor(providerId, message, code, originalError) {
        super(message);
        this.providerId = providerId;
        this.code = code;
        this.originalError = originalError;
        this.name = 'ProviderError';
    }
}
exports.ProviderError = ProviderError;
class AuthenticationError extends ProviderError {
    constructor(providerId, message, originalError) {
        super(providerId, message, 'AUTH_ERROR', originalError);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class ExecutionError extends ProviderError {
    constructor(providerId, message, originalError) {
        super(providerId, message, 'EXECUTION_ERROR', originalError);
        this.name = 'ExecutionError';
    }
}
exports.ExecutionError = ExecutionError;
class TimeoutError extends ProviderError {
    constructor(providerId, timeout, originalError) {
        super(providerId, `Operation timed out after ${timeout}ms`, 'TIMEOUT_ERROR', originalError);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class ConfigurationError extends ProviderError {
    constructor(providerId, message, originalError) {
        super(providerId, message, 'CONFIG_ERROR', originalError);
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
//# sourceMappingURL=provider.js.map