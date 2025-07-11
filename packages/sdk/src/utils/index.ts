/**
 * Utility functions for the universal LLM integration layer
 * 
 * This module contains helper functions, validators, formatters,
 * and other utilities used throughout the SDK.
 * 
 * @version 1.0.0
 */

// Export utility modules
// Note: These modules will be implemented in future versions
// export * from './validation';
// export * from './formatting';
// export * from './crypto';
// export * from './http';
// export * from './retry';
// export * from './cache';
// export * from './logger';
// export * from './metrics';
// export * from './events';
// export * from './stream';
// export * from './config';
// export * from './error';
// export * from './auth';
// export * from './rate-limit';
// export * from './circuit-breaker';
// export * from './load-balancer';
// export * from './health-check';
// export * from './monitoring';
// export * from './security';
// export * from './compression';
// export * from './serialization';
// export * from './time';
// export * from './string';
// export * from './number';
// export * from './array';
// export * from './object';
// export * from './promise';
// export * from './url';
// export * from './file';
// export * from './regex';
// export * from './random';

/**
 * Common utility functions
 */
export namespace Utils {
  /**
   * Delay execution for specified milliseconds
   */
  export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a random UUID v4
   */
  export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a random string of specified length
   */
  export function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Deep clone an object
   */
  export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
    
    if (obj instanceof Array) {
      return obj.map(item => deepClone(item)) as unknown as T;
    }
    
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = deepClone(obj[key]);
        }
      }
      return cloned;
    }
    
    return obj;
  }

  /**
   * Check if a value is empty
   */
  export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length === 0;
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    
    return false;
  }

  /**
   * Debounce a function
   */
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle a function
   */
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  /**
   * Retry a function with exponential backoff
   */
  export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000,
    backoffFactor: number = 2
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
        await Utils.delay(delay);
      }
    }
    
    throw lastError!;
  }

  /**
   * Create a timeout promise
   */
  export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), ms);
      })
    ]);
  }

  /**
   * Flatten a nested object
   */
  export function flattenObject(obj: any, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  /**
   * Unflatten a flattened object
   */
  export function unflattenObject(obj: Record<string, any>): any {
    const unflattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const keys = key.split('.');
        let current = unflattened;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (k && !(k in current)) {
            current[k] = {};
          }
          if (k) {
            current = current[k];
          }
        }
        
        const lastKey = keys[keys.length - 1];
        if (lastKey) {
          current[lastKey] = obj[key];
        }
      }
    }
    
    return unflattened;
  }

  /**
   * Merge objects deeply
   */
  export function deepMerge<T>(...objects: Partial<T>[]): T {
    const result = {} as T;
    
    for (const obj of objects) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = deepMerge(result[key] || {}, value);
          } else {
            result[key] = value as T[Extract<keyof T, string>];
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Calculate exponential backoff delay
   */
  export function calculateBackoffDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 10000,
    backoffFactor: number = 2,
    jitter: boolean = true
  ): number {
    const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
    
    if (jitter) {
      return delay * (0.5 + Math.random() * 0.5);
    }
    
    return delay;
  }

  /**
   * Format bytes to human readable string
   */
  export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format duration to human readable string
   */
  export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Truncate a string to specified length
   */
  export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Capitalize first letter of a string
   */
  export function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert camelCase to snake_case
   */
  export function camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * Convert snake_case to camelCase
   */
  export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Check if a string is a valid email
   */
  export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if a string is a valid URL
   */
  export function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize a string for use in HTML
   */
  export function sanitizeHtml(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'/]/g, (match) => map[match] || match);
  }

  /**
   * Parse query string to object
   */
  export function parseQueryString(query: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(query);
    
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  }

  /**
   * Convert object to query string
   */
  export function objectToQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
        params.append(key, String(obj[key]));
      }
    }
    
    return params.toString();
  }

  /**
   * Get nested property value from object
   */
  export function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested property value in object
   */
  export function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (key && (!(key in current) || typeof current[key] !== 'object')) {
        current[key] = {};
      }
      if (key) {
        current = current[key];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  }

  /**
   * Remove undefined/null values from object
   */
  export function removeEmptyValues(obj: any): any {
    const cleaned: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            const cleanedValue = removeEmptyValues(value);
            if (Object.keys(cleanedValue).length > 0) {
              cleaned[key] = cleanedValue;
            }
          } else {
            cleaned[key] = value;
          }
        }
      }
    }
    
    return cleaned;
  }
}

/**
 * Default export with all utilities
 */
export default Utils;