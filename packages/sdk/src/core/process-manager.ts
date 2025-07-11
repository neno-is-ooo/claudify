import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';
import { 
  ClaudeCodeNotFoundError, 
  ClaudeCodeTimeoutError, 
  ClaudeCodeProcessError,
  ModelNotAvailableError,
  WorkspaceAccessError,
  SessionContinuityError,
  categorizeError 
} from '../types/errors.js';

export interface ClaudeCodeOptions {
  workspacePath?: string;
  modelId?: string;
  timeout?: number;
  env?: Record<string, string>;
  jsonOutput?: boolean;
  // Session continuity options
  continueSession?: boolean;
  sessionId?: string;
  resumeLastSession?: boolean;
}

export interface ProcessResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
}

export class ClaudeCodeProcessManager {
  private readonly defaultTimeout = 30000; // 30 seconds

  /**
   * Spawn a Claude Code process with the specified options
   */
  spawn(options: ClaudeCodeOptions = {}): ChildProcess {
    const args = this.buildArgs(options);
    
    return spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: options.workspacePath || process.cwd(),
      env: { 
        ...process.env, 
        ...options.env 
      }
    });
  }

  /**
   * Build command line arguments for Claude Code
   */
  private buildArgs(options: ClaudeCodeOptions): string[] {
    // Session continuity handling
    if (options.continueSession || options.resumeLastSession) {
      // Use --continue flag for session continuity
      const args = ['--continue'];
      
      if (options.modelId) {
        args.push('--model', options.modelId);
      }
      
      return args;
    }
    
    // For batch processing, use --print flag for non-interactive output
    const args = ['--print'];
    
    if (options.modelId) {
      args.push('--model', options.modelId);
    }
    
    if (options.sessionId) {
      // If session ID provided, add --resume flag for session continuity
      args.push('--resume', options.sessionId);
    }
    
    if (options.jsonOutput) {
      args.push('--output-format', 'json');
    } else {
      args.push('--output-format', 'text');
    }
    
    return args;
  }

  /**
   * Execute a Claude Code process with input and return the complete result
   */
  async executeProcess(options: ClaudeCodeOptions, input: string): Promise<ProcessResult> {
    const timeout = options.timeout || this.defaultTimeout;
    
    return new Promise((resolve, reject) => {
      const process = this.spawn(options);
      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;

      // Set up timeout
      timeoutId = setTimeout(() => {
        process.kill('SIGTERM');
        reject(new ClaudeCodeTimeoutError(timeout));
      }, timeout);

      // Collect stdout
      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr
      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      process.on('close', (code, signal) => {
        clearTimeout(timeoutId);
        
        const result = {
          success: code === 0,
          stdout,
          stderr,
          exitCode: code,
          signal
        };
        
        // If process failed, try to categorize the error
        if (code !== 0) {
          const error = new ClaudeCodeProcessError(code || -1, stderr);
          const categorizedError = categorizeError(error, {
            modelId: options.modelId,
            workspacePath: options.workspacePath,
            timeoutMs: timeout
          });
          
          // Still resolve with result, but include error info
          result.success = false;
        }
        
        resolve(result);
      });

      // Handle process errors
      process.on('error', (error) => {
        clearTimeout(timeoutId);
        const categorizedError = categorizeError(error, {
          modelId: options.modelId,
          workspacePath: options.workspacePath,
          timeoutMs: timeout
        });
        reject(categorizedError);
      });

      // Send input and close stdin
      if (input) {
        process.stdin?.write(input);
      }
      process.stdin?.end();
    });
  }

  /**
   * Execute a Claude Code process with streaming output
   */
  async *executeProcessStream(options: ClaudeCodeOptions, input: string): AsyncGenerator<string> {
    const process = this.spawn(options);
    const timeout = options.timeout || this.defaultTimeout;
    
    let timeoutId: NodeJS.Timeout;
    let processEnded = false;

    // Set up timeout
    timeoutId = setTimeout(() => {
      process.kill('SIGTERM');
      processEnded = true;
    }, timeout);
    
    // Handle process errors for streaming
    process.on('error', (error) => {
      clearTimeout(timeoutId);
      processEnded = true;
      const categorizedError = categorizeError(error, {
        modelId: options.modelId,
        workspacePath: options.workspacePath,
        timeoutMs: timeout
      });
      throw categorizedError;
    });

    // Send input
    if (input) {
      process.stdin?.write(input);
    }
    process.stdin?.end();

    // Stream stdout
    if (process.stdout) {
      const reader = process.stdout;
      reader.setEncoding('utf8');

      for await (const chunk of reader) {
        if (processEnded) break;
        yield chunk.toString();
      }
    }

    // Wait for process to complete
    await new Promise<void>((resolve, reject) => {
      process.on('close', (code, signal) => {
        clearTimeout(timeoutId);
        processEnded = true;
        
        if (code !== 0) {
          const error = new ClaudeCodeProcessError(code || -1, 'Process failed during streaming');
          const categorizedError = categorizeError(error, {
            modelId: options.modelId,
            workspacePath: options.workspacePath,
            timeoutMs: timeout
          });
          reject(categorizedError);
        } else {
          resolve();
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeoutId);
        processEnded = true;
        const categorizedError = categorizeError(error, {
          modelId: options.modelId,
          workspacePath: options.workspacePath,
          timeoutMs: timeout
        });
        reject(categorizedError);
      });
    });
  }

  /**
   * Check if Claude Code is available on the system
   */
  async isClaudeCodeAvailable(): Promise<boolean> {
    try {
      // Use --version to check if claude CLI is available
      const process = spawn('claude', ['--version']);
      
      return new Promise((resolve) => {
        process.on('close', (code) => {
          resolve(code === 0);
        });
        
        process.on('error', (error) => {
          // Don't throw here, just return false for availability check
          resolve(false);
        });
        
        // Set a timeout
        setTimeout(() => {
          process.kill();
          resolve(false);
        }, 5000);
      });
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check Claude Code availability and throw appropriate error if not found
   */
  async ensureClaudeCodeAvailable(): Promise<void> {
    const isAvailable = await this.isClaudeCodeAvailable();
    if (!isAvailable) {
      throw new ClaudeCodeNotFoundError();
    }
  }

  /**
   * Get Claude Code version information
   */
  async getClaudeCodeVersion(): Promise<string | null> {
    try {
      const process = spawn('claude', ['--version']);
      let output = '';
      
      process.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      return new Promise((resolve) => {
        process.on('close', (code) => {
          if (code === 0) {
            resolve(output.trim());
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Execute Claude Code with session continuity support
   */
  async executeWithContinuity(options: ClaudeCodeOptions, input: string): Promise<ProcessResult> {
    // Enable session continuity automatically if workspace is provided
    const continuityOptions: ClaudeCodeOptions = {
      ...options,
      continueSession: options.continueSession ?? true, // Default to true for continuity
    };

    return this.executeProcess(continuityOptions, input);
  }

  /**
   * Resume last session in the specified workspace
   */
  async resumeLastSession(workspacePath: string, modelId?: string): Promise<ProcessResult> {
    const options: ClaudeCodeOptions = {
      workspacePath,
      modelId,
      resumeLastSession: true,
    };

    // For resume, we just need to trigger the continue flag
    // The input can be empty as we're resuming
    return this.executeProcess(options, '');
  }

  /**
   * Check if there are existing sessions in the workspace
   */
  async hasExistingSessions(workspacePath: string): Promise<boolean> {
    try {
      // We can check this by trying to use --continue and seeing if it works
      const process = spawn('claude', ['--continue', '--help'], {
        cwd: workspacePath,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return new Promise((resolve) => {
        let stderr = '';
        
        process.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
        
        process.on('close', (code) => {
          // If --continue flag works without error, sessions likely exist
          // This is a heuristic check
          resolve(code === 0 && !stderr.includes('No session found'));
        });
        
        process.on('error', () => {
          resolve(false);
        });
        
        // Timeout after 3 seconds
        setTimeout(() => {
          process.kill();
          resolve(false);
        }, 3000);
      });
    } catch (error) {
      return false;
    }
  }
}