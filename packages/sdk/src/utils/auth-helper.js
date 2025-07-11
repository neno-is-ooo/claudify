"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthHelper = void 0;
class AuthHelper {
    static validateCredentials(credentials) {
        switch (credentials.type) {
            case 'none':
                return true;
            case 'bearer':
                return !!credentials.token;
            case 'oauth':
                return !!credentials.token && !!credentials.refreshToken;
            case 'apikey':
                return !!credentials.apiKey;
            default:
                return false;
        }
    }
    static isTokenExpired(credentials) {
        if (!credentials.expiresAt) {
            return false;
        }
        return Date.now() >= credentials.expiresAt;
    }
    static createAuthResult(success, token, expiresAt, error) {
        return {
            success,
            token,
            expiresAt,
            error
        };
    }
    static maskSensitiveData(credentials) {
        const masked = { ...credentials };
        if (masked.token) {
            masked.token = this.maskToken(masked.token);
        }
        if (masked.refreshToken) {
            masked.refreshToken = this.maskToken(masked.refreshToken);
        }
        if (masked.apiKey) {
            masked.apiKey = this.maskToken(masked.apiKey);
        }
        return masked;
    }
    static maskToken(token) {
        if (token.length <= 8) {
            return '*'.repeat(token.length);
        }
        return token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4);
    }
    static createBearerCredentials(token, expiresAt) {
        return {
            type: 'bearer',
            token,
            expiresAt
        };
    }
    static createOAuthCredentials(token, refreshToken, expiresAt) {
        return {
            type: 'oauth',
            token,
            refreshToken,
            expiresAt
        };
    }
    static createApiKeyCredentials(apiKey) {
        return {
            type: 'apikey',
            apiKey
        };
    }
    static createNoneCredentials() {
        return {
            type: 'none'
        };
    }
}
exports.AuthHelper = AuthHelper;
//# sourceMappingURL=auth-helper.js.map