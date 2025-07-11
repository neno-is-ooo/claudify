import { ClaudeCodeMessage, ExecutionResult } from '../types/base.js';

export interface LLMResponse {
  content: string;
  role: 'assistant';
  metadata?: {
    model?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    cost_usd?: number;
    duration_ms?: number;
  };
}

export interface LLMChunk {
  content: string;
  done: boolean;
  metadata?: {
    model?: string;
    chunk_index?: number;
  };
}

export interface ResponseMetadata {
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  cost_usd?: number;
  duration_ms?: number;
  turns?: number;
}

export class ClaudeCodeResponseParser {
  /**
   * Parse Claude Code process output into a standardized LLM response
   */
  async parseResponse(output: string): Promise<LLMResponse> {
    try {
      // Try to parse as JSON first (if --json flag was used)
      const jsonResponse = this.tryParseJsonResponse(output);
      if (jsonResponse) {
        return jsonResponse;
      }

      // Fall back to text parsing
      return this.parseTextResponse(output);
    } catch (error) {
      throw new Error(`Failed to parse Claude Code response: ${error}`);
    }
  }

  /**
   * Parse streaming Claude Code output
   */
  async *parseStreamingResponse(outputStream: AsyncIterable<string>): AsyncGenerator<LLMChunk> {
    let buffer = '';
    let chunkIndex = 0;
    
    for await (const chunk of outputStream) {
      buffer += chunk;
      
      // Try to extract complete messages from buffer
      const messages = this.extractMessagesFromBuffer(buffer);
      
      for (const message of messages) {
        yield {
          content: message,
          done: false,
          metadata: {
            chunk_index: chunkIndex++
          }
        };
        
        // Remove processed message from buffer
        buffer = buffer.replace(message, '');
      }
    }
    
    // Send final chunk if there's remaining content
    if (buffer.trim()) {
      yield {
        content: buffer.trim(),
        done: false,
        metadata: {
          chunk_index: chunkIndex++
        }
      };
    }
    
    // Send completion signal
    yield {
      content: '',
      done: true,
      metadata: {
        chunk_index: chunkIndex
      }
    };
  }

  /**
   * Extract metadata from Claude Code output
   */
  extractMetadata(output: string): ResponseMetadata {
    const metadata: ResponseMetadata = {};
    
    // Extract model information
    const modelMatch = output.match(/model[:\s]+([^\n\r]+)/i);
    if (modelMatch) {
      metadata.model = modelMatch[1].trim();
    }
    
    // Extract cost information
    const costMatch = output.match(/cost[:\s]+\$?([0-9.]+)/i);
    if (costMatch) {
      metadata.cost_usd = parseFloat(costMatch[1]);
    }
    
    // Extract duration information
    const durationMatch = output.match(/duration[:\s]+([0-9.]+)\s*ms/i);
    if (durationMatch) {
      metadata.duration_ms = parseFloat(durationMatch[1]);
    }
    
    // Extract token usage
    const promptTokensMatch = output.match(/prompt_tokens[:\s]+([0-9]+)/i);
    const completionTokensMatch = output.match(/completion_tokens[:\s]+([0-9]+)/i);
    
    if (promptTokensMatch || completionTokensMatch) {
      metadata.usage = {
        prompt_tokens: promptTokensMatch ? parseInt(promptTokensMatch[1]) : undefined,
        completion_tokens: completionTokensMatch ? parseInt(completionTokensMatch[1]) : undefined
      };
      
      if (metadata.usage.prompt_tokens && metadata.usage.completion_tokens) {
        metadata.usage.total_tokens = metadata.usage.prompt_tokens + metadata.usage.completion_tokens;
      }
    }
    
    return metadata;
  }

  /**
   * Try to parse JSON response from Claude Code --json output
   */
  private tryParseJsonResponse(output: string): LLMResponse | null {
    try {
      const lines = output.split('\n');
      
      for (const line of lines) {
        if (line.trim() && line.startsWith('{')) {
          const parsed = JSON.parse(line);
          
          if (parsed.type === 'assistant_message' && parsed.content) {
            return {
              content: parsed.content,
              role: 'assistant',
              metadata: this.extractMetadata(output)
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse text response from Claude Code
   */
  private parseTextResponse(output: string): LLMResponse {
    // When using claude --print, the output is just the raw response
    // No need to look for "Assistant:" or "Claude:" prefixes
    
    return {
      content: output.trim(),
      role: 'assistant',
      metadata: this.extractMetadata(output)
    };
  }

  /**
   * Check if a line contains metadata rather than response content
   */
  private isMetadataLine(line: string): boolean {
    const metadataPatterns = [
      /^model:/i,
      /^cost:/i,
      /^duration:/i,
      /^tokens:/i,
      /^usage:/i,
      /^\[.*\]$/,
      /^✓/,
      /^❌/,
      /^━/,
      /^📋/,
      /^🔧/,
      /^💭/
    ];
    
    return metadataPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Extract complete messages from a streaming buffer
   */
  private extractMessagesFromBuffer(buffer: string): string[] {
    const messages: string[] = [];
    const lines = buffer.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !this.isMetadataLine(line.trim())) {
        messages.push(line.trim());
      }
    }
    
    return messages;
  }

  /**
   * Validate that the response is properly formatted
   */
  validateResponse(response: LLMResponse): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!response.content || typeof response.content !== 'string') {
      errors.push('Response content must be a non-empty string');
    }
    
    if (response.role !== 'assistant') {
      errors.push('Response role must be "assistant"');
    }
    
    if (response.metadata) {
      if (response.metadata.cost_usd && (typeof response.metadata.cost_usd !== 'number' || response.metadata.cost_usd < 0)) {
        errors.push('Cost must be a positive number');
      }
      
      if (response.metadata.duration_ms && (typeof response.metadata.duration_ms !== 'number' || response.metadata.duration_ms < 0)) {
        errors.push('Duration must be a positive number');
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
}

/**
 * Enhanced response parsing utilities for extracting structured data
 * from Claude responses - addressing common production app needs
 */
export class ResponseParser {
  /**
   * Helper method to safely extract content from response messages
   */
  static extractContent(response: ExecutionResult): string | null {
    const lastMessage = response.messages[response.messages.length - 1];
    return lastMessage && 'content' in lastMessage ? lastMessage.content : null;
  }
  /**
   * Extract and parse JSON from Claude's response
   * Looks for JSON in code blocks or inline JSON objects
   */
  static parseJSON<T = any>(response: ExecutionResult): T | null {
    try {
      const content = this.extractContent(response);
      if (!content) return null;
      
      // Try to find JSON in code blocks first
      const jsonBlockMatch = content.match(/```json\n([\s\S]*?)\n```/i);
      if (jsonBlockMatch) {
        return JSON.parse(jsonBlockMatch[1]);
      }
      
      // Try to find inline JSON objects
      const jsonInlineMatch = content.match(/\{[\s\S]*\}/);
      if (jsonInlineMatch) {
        return JSON.parse(jsonInlineMatch[0]);
      }
      
      // Try to find JSON arrays
      const jsonArrayMatch = content.match(/\[[\s\S]*\]/);
      if (jsonArrayMatch) {
        return JSON.parse(jsonArrayMatch[0]);
      }
      
      return null;
    } catch (error) {
      // Invalid JSON found
      return null;
    }
  }

  /**
   * Extract markdown content, removing code block wrappers
   */
  static parseMarkdown(response: ExecutionResult): string {
    const content = this.extractContent(response);
    if (!content) return '';
    
    // Remove code block wrappers but keep the content
    return content.replace(/```[\w]*\n([\s\S]*?)\n```/g, '$1').trim();
  }

  /**
   * Extract all code blocks from Claude's response
   * Returns array of code blocks with their language identifiers
   */
  static parseCodeBlocks(response: ExecutionResult): Array<{
    language?: string;
    code: string;
  }> {
    const content = this.extractContent(response);
    if (!content) return [];
    
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    const blocks: Array<{ language?: string; code: string }> = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || undefined,
        code: match[2].trim()
      });
    }
    
    return blocks;
  }

  /**
   * Extract code blocks of a specific language
   */
  static parseCodeBlocksByLanguage(response: ExecutionResult, language: string): string[] {
    const blocks = this.parseCodeBlocks(response);
    return blocks
      .filter(block => block.language === language)
      .map(block => block.code);
  }

  /**
   * Extract plain text content, removing all markdown formatting
   */
  static parseText(response: ExecutionResult): string {
    const content = this.extractContent(response);
    if (!content) return '';
    
    return content
      // Remove code blocks
      .replace(/```[\w]*\n[\s\S]*?\n```/g, '')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove headers
      .replace(/^#+\s+(.+)$/gm, '$1')
      // Remove bullet points
      .replace(/^[\s]*[-*+]\s+/gm, '')
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Extract file paths mentioned in the response
   */
  static parseFilePaths(response: ExecutionResult): string[] {
    const content = this.extractContent(response);
    if (!content) return [];
    
    // Common file path patterns
    const pathPatterns = [
      // Unix/Linux paths
      /(?:^|\s)(\/[a-zA-Z0-9._\-\/]+\.[a-zA-Z0-9]+)/g,
      // Relative paths
      /(?:^|\s)(\.[a-zA-Z0-9._\-\/]+\.[a-zA-Z0-9]+)/g,
      // Windows paths
      /(?:^|\s)([a-zA-Z]:\\[a-zA-Z0-9._\-\\]+\.[a-zA-Z0-9]+)/g,
      // Common project paths
      /(?:^|\s)(src\/[a-zA-Z0-9._\-\/]+)/g,
      /(?:^|\s)(lib\/[a-zA-Z0-9._\-\/]+)/g,
      /(?:^|\s)(dist\/[a-zA-Z0-9._\-\/]+)/g,
    ];
    
    const paths = new Set<string>();
    
    for (const pattern of pathPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        paths.add(match[1]);
      }
    }
    
    return Array.from(paths);
  }

  /**
   * Extract URLs from the response
   */
  static parseURLs(response: ExecutionResult): string[] {
    const content = this.extractContent(response);
    if (!content) return [];
    
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    const matches = content.match(urlPattern);
    return matches || [];
  }

  /**
   * Parse a list or array from natural language response
   */
  static parseList(response: ExecutionResult): string[] {
    const content = this.extractContent(response);
    if (!content) return [];
    
    const lines = content.split('\n');
    const listItems: string[] = [];
    
    for (const line of lines) {
      // Match bullet points, numbers, or dashes
      const match = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/);
      if (match) {
        listItems.push(match[1].trim());
      }
    }
    
    return listItems;
  }

  /**
   * Extract summary or conclusion from response
   * Looks for common summary patterns
   */
  static parseSummary(response: ExecutionResult): string | null {
    const content = this.extractContent(response);
    if (!content) return null;
    
    // Look for common summary markers
    const summaryPatterns = [
      /(?:summary|conclusion|in summary|to summarize|overview):\s*([^.\n]+(?:\.[^.\n]+)*)/i,
      /(?:^|\n)(?:summary|conclusion|in summary|to summarize|overview):\s*([^.\n]+(?:\.[^.\n]+)*)/i,
      // Look for content after "In conclusion" or similar
      /(?:in conclusion|to conclude|finally)[:,]?\s*([^.\n]+(?:\.[^.\n]+)*)/i,
    ];
    
    for (const pattern of summaryPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // If no explicit summary found, return the first paragraph
    const paragraphs = content.split('\n\n').filter((p: string) => p.trim().length > 0);
    if (paragraphs.length > 0) {
      const firstParagraph = paragraphs[0].trim();
      // Return first paragraph if it's reasonable length for a summary
      if (firstParagraph.length <= 500) {
        return firstParagraph;
      }
    }
    
    return null;
  }
}

/**
 * Type-safe parsing utilities with validation
 */
export class TypedResponseParser {
  /**
   * Parse JSON with type validation
   */
  static parseTypedJSON<T>(
    response: ExecutionResult, 
    validator: (obj: any) => obj is T
  ): T | null {
    const parsed = ResponseParser.parseJSON(response);
    if (parsed && validator(parsed)) {
      return parsed;
    }
    return null;
  }

  /**
   * Parse number from response
   */
  static parseNumber(response: ExecutionResult): number | null {
    const content = ResponseParser.extractContent(response);
    if (!content) return null;
    
    const numberMatch = content.match(/\b(\d+(?:\.\d+)?)\b/);
    if (numberMatch) {
      const num = parseFloat(numberMatch[1]);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  /**
   * Parse boolean from response
   */
  static parseBoolean(response: ExecutionResult): boolean | null {
    const content = ResponseParser.extractContent(response);
    if (!content) return null;
    
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('true') || lowerContent.includes('yes') || lowerContent.includes('correct')) {
      return true;
    }
    
    if (lowerContent.includes('false') || lowerContent.includes('no') || lowerContent.includes('incorrect')) {
      return false;
    }
    
    return null;
  }
}