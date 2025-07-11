/**
 * Enhanced error categories for Claude CC SDK
 * 
 * These specific error types help developers handle common failure scenarios
 * with actionable error messages and clear next steps.
 */

export class ClaudeCodeNotFoundError extends Error {
  constructor() {
    super(
      'Claude Code CLI not found. Please install Claude Code first.\n' +
      'Visit: https://docs.anthropic.com/en/docs/claude-code for installation instructions.'
    );
    this.name = 'ClaudeCodeNotFoundError';
  }
}

export class ModelNotAvailableError extends Error {
  constructor(model: string) {
    super(
      `Model '${model}' is not available in Claude Code.\n` +
      'Available models: "sonnet" (fast & efficient) or "opus" (most capable).'
    );
    this.name = 'ModelNotAvailableError';
  }
}

export class SessionNotFoundError extends Error {
  constructor(workspacePath: string) {
    super(
      `No existing Claude Code session found in workspace: ${workspacePath}\n` +
      'To use session continuity, either start a new conversation or ensure the workspace has a previous session.'
    );
    this.name = 'SessionNotFoundError';
  }
}

export class WorkspaceAccessError extends Error {
  constructor(path: string, reason?: string) {
    const baseMessage = `Cannot access workspace: ${path}`;
    const fullMessage = reason 
      ? `${baseMessage}\nReason: ${reason}\nPlease check folder permissions and path validity.`
      : `${baseMessage}\nPlease check that the path exists and you have read/write permissions.`;
    
    super(fullMessage);
    this.name = 'WorkspaceAccessError';
  }
}

export class ClaudeCodeTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Claude Code execution timed out after ${timeoutMs}ms.\n` +
      'Try increasing the timeout value or simplifying your request.'
    );
    this.name = 'ClaudeCodeTimeoutError';
  }
}

export class ClaudeCodeProcessError extends Error {
  constructor(exitCode: number, stderr: string) {
    super(
      `Claude Code process failed with exit code ${exitCode}.\n` +
      `Error output: ${stderr}\n` +
      'Check that Claude Code is properly authenticated and up to date.'
    );
    this.name = 'ClaudeCodeProcessError';
  }
}

export class InvalidModelResponseError extends Error {
  constructor(response: string) {
    const truncated = response.length > 200 ? response.substring(0, 200) + '...' : response;
    super(
      `Claude Code returned an invalid response format.\n` +
      `Response: ${truncated}\n` +
      'This may indicate a Claude Code CLI issue or unexpected output format.'
    );
    this.name = 'InvalidModelResponseError';
  }
}

export class SessionContinuityError extends Error {
  constructor(message: string) {
    super(
      `Session continuity failed: ${message}\n` +
      'Try starting a fresh conversation or check workspace permissions.'
    );
    this.name = 'SessionContinuityError';
  }
}

// Helper function to categorize generic errors into specific ones
export function categorizeError(error: any, context?: {
  modelId?: string;
  workspacePath?: string;
  timeoutMs?: number;
}): Error {
  const message = error.message || error.toString();
  const lowerMessage = message.toLowerCase();

  // Claude Code CLI not found
  if (lowerMessage.includes('command not found') || 
      lowerMessage.includes('claude') && lowerMessage.includes('not found') ||
      error.code === 'ENOENT' && lowerMessage.includes('claude')) {
    return new ClaudeCodeNotFoundError();
  }

  // Model not available
  if (context?.modelId && (
      lowerMessage.includes('invalid model') ||
      lowerMessage.includes('model not found') ||
      lowerMessage.includes('unknown model')
  )) {
    return new ModelNotAvailableError(context.modelId);
  }

  // Workspace access issues
  if (context?.workspacePath && (
      lowerMessage.includes('permission denied') ||
      lowerMessage.includes('access denied') ||
      lowerMessage.includes('no such file or directory') ||
      error.code === 'EACCES' ||
      error.code === 'ENOENT'
  )) {
    return new WorkspaceAccessError(context.workspacePath, message);
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return new ClaudeCodeTimeoutError(context?.timeoutMs || 30000);
  }

  // Session continuity issues
  if (lowerMessage.includes('no session') || 
      lowerMessage.includes('session not found') ||
      lowerMessage.includes('continue') && lowerMessage.includes('failed')) {
    return new SessionContinuityError(message);
  }

  // Process execution errors
  if (error.exitCode !== undefined) {
    return new ClaudeCodeProcessError(error.exitCode, error.stderr || message);
  }

  // Invalid response format
  if (lowerMessage.includes('invalid response') || 
      lowerMessage.includes('unexpected output')) {
    return new InvalidModelResponseError(message);
  }

  // Return original error if we can't categorize it
  return error;
}