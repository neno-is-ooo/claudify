/**
 * Event-driven streaming types for Claude CC SDK
 * 
 * These events provide rich context for streaming responses,
 * enabling better UX with loading states, progress indicators,
 * and detailed metadata.
 */

export interface ClaudeEvent {
  type: 'thinking' | 'chunk' | 'complete' | 'error' | 'session_created' | 'session_continued';
  data: string;
  metadata?: ClaudeEventMetadata;
}

export interface ClaudeEventMetadata {
  // Timing information
  timestamp?: number;
  duration?: number;
  startTime?: number;
  
  // Model and session info
  model?: string;
  sessionId?: string;
  workspacePath?: string;
  
  // Streaming progress
  chunkIndex?: number;
  totalLength?: number;
  estimatedCompletion?: number;
  
  // Error details
  errorType?: string;
  errorCode?: number;
  
  // Performance metrics
  responseTime?: number;
  tokenCount?: number;
  estimatedCost?: number;
}

export interface ThinkingEvent extends ClaudeEvent {
  type: 'thinking';
  data: string; // e.g., "Claude Sonnet is thinking..."
  metadata?: ClaudeEventMetadata & {
    model: string;
    estimatedWaitTime?: number;
  };
}

export interface ChunkEvent extends ClaudeEvent {
  type: 'chunk';
  data: string; // The actual text chunk
  metadata: ClaudeEventMetadata & {
    chunkIndex: number;
    totalLength: number;
    timestamp: number;
  };
}

export interface CompleteEvent extends ClaudeEvent {
  type: 'complete';
  data: string; // Final completion message
  metadata: ClaudeEventMetadata & {
    duration: number;
    totalLength: number;
    chunkCount?: number;
    responseTime: number;
  };
}

export interface ErrorEvent extends ClaudeEvent {
  type: 'error';
  data: string; // Error message
  metadata: ClaudeEventMetadata & {
    errorType: string;
    errorCode?: number;
    originalError?: Error;
  };
}

export interface SessionCreatedEvent extends ClaudeEvent {
  type: 'session_created';
  data: string; // e.g., "New session created"
  metadata: ClaudeEventMetadata & {
    sessionId: string;
    workspacePath: string;
  };
}

export interface SessionContinuedEvent extends ClaudeEvent {
  type: 'session_continued';
  data: string; // e.g., "Continuing previous session"
  metadata: ClaudeEventMetadata & {
    sessionId: string;
    workspacePath: string;
    previousContextSize?: number;
  };
}

// Type guards for event types
export function isThinkingEvent(event: ClaudeEvent): event is ThinkingEvent {
  return event.type === 'thinking';
}

export function isChunkEvent(event: ClaudeEvent): event is ChunkEvent {
  return event.type === 'chunk';
}

export function isCompleteEvent(event: ClaudeEvent): event is CompleteEvent {
  return event.type === 'complete';
}

export function isErrorEvent(event: ClaudeEvent): event is ErrorEvent {
  return event.type === 'error';
}

export function isSessionCreatedEvent(event: ClaudeEvent): event is SessionCreatedEvent {
  return event.type === 'session_created';
}

export function isSessionContinuedEvent(event: ClaudeEvent): event is SessionContinuedEvent {
  return event.type === 'session_continued';
}

// Event factory functions
export class ClaudeEventFactory {
  static createThinkingEvent(model: string, estimatedWaitTime?: number): ThinkingEvent {
    const modelName = model === 'opus' ? 'Opus' : 'Sonnet';
    return {
      type: 'thinking',
      data: `Claude ${modelName} is thinking...`,
      metadata: {
        model,
        timestamp: Date.now(),
        estimatedWaitTime
      }
    };
  }

  static createChunkEvent(
    chunk: string, 
    chunkIndex: number, 
    totalLength: number
  ): ChunkEvent {
    return {
      type: 'chunk',
      data: chunk,
      metadata: {
        chunkIndex,
        totalLength,
        timestamp: Date.now()
      }
    };
  }

  static createCompleteEvent(
    duration: number,
    totalLength: number,
    chunkCount: number,
    model?: string
  ): CompleteEvent {
    return {
      type: 'complete',
      data: 'Response complete',
      metadata: {
        duration,
        totalLength,
        chunkCount,
        responseTime: duration,
        timestamp: Date.now(),
        model
      }
    };
  }

  static createErrorEvent(
    error: Error,
    errorType?: string
  ): ErrorEvent {
    return {
      type: 'error',
      data: error.message,
      metadata: {
        errorType: errorType || error.constructor.name,
        timestamp: Date.now(),
        originalError: error
      }
    };
  }

  static createSessionCreatedEvent(
    sessionId: string,
    workspacePath: string
  ): SessionCreatedEvent {
    return {
      type: 'session_created',
      data: 'New session created',
      metadata: {
        sessionId,
        workspacePath,
        timestamp: Date.now()
      }
    };
  }

  static createSessionContinuedEvent(
    sessionId: string,
    workspacePath: string,
    previousContextSize?: number
  ): SessionContinuedEvent {
    return {
      type: 'session_continued',
      data: 'Continuing previous session',
      metadata: {
        sessionId,
        workspacePath,
        previousContextSize,
        timestamp: Date.now()
      }
    };
  }
}