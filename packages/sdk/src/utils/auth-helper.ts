import { AuthCredentials, AuthResult } from '../types/base.js';

export class AuthHelper {
  static validateCredentials(credentials: AuthCredentials): boolean {
    switch (credentials.type) {
      case 'none':
        return true;
      case 'bearer':
        return !!credentials.token;
      case 'api_key':
        return !!credentials.apiKey;
      default:
        return false;
    }
  }

  static isExpired(credentials: AuthCredentials): boolean {
    // For now, credentials don't expire in our simplified model
    return false;
  }

  static createAuthResult(success: boolean, metadata?: Record<string, any>): AuthResult {
    return {
      success,
      metadata
    };
  }

  static maskSensitiveData(credentials: AuthCredentials): Partial<AuthCredentials> {
    const masked = { ...credentials };

    if (masked.token) {
      masked.token = AuthHelper.maskToken(masked.token);
    }

    if (masked.apiKey) {
      masked.apiKey = AuthHelper.maskToken(masked.apiKey);
    }

    return masked;
  }

  static createNoneCredentials(): AuthCredentials {
    return {
      type: 'none'
    };
  }

  static createBearerCredentials(token: string): AuthCredentials {
    return {
      type: 'bearer',
      token
    };
  }

  static createApiKeyCredentials(apiKey: string): AuthCredentials {
    return {
      type: 'api_key',
      apiKey
    };
  }

  private static maskToken(token: string): string {
    if (token.length <= 8) {
      return '*'.repeat(token.length);
    }
    return token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4);
  }
}