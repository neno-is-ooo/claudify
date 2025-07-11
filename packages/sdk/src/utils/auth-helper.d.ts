import { AuthCredentials, AuthResult } from '../types/base';
export declare class AuthHelper {
    static validateCredentials(credentials: AuthCredentials): boolean;
    static isTokenExpired(credentials: AuthCredentials): boolean;
    static createAuthResult(success: boolean, token?: string, expiresAt?: number, error?: string): AuthResult;
    static maskSensitiveData(credentials: AuthCredentials): Partial<AuthCredentials>;
    private static maskToken;
    static createBearerCredentials(token: string, expiresAt?: number): AuthCredentials;
    static createOAuthCredentials(token: string, refreshToken: string, expiresAt?: number): AuthCredentials;
    static createApiKeyCredentials(apiKey: string): AuthCredentials;
    static createNoneCredentials(): AuthCredentials;
}
