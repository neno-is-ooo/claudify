import { ProviderId, ProviderConfig, ProviderCapabilities } from '../types/base';
import { IProvider, ProviderFactory } from '../types/provider';
import { ClaudeCodeProvider } from './claude-code-provider';

export class ClaudeCodeProviderFactory implements ProviderFactory {
  private static readonly PROVIDER_ID = 'claude-code' as ProviderId;
  
  private static readonly CAPABILITIES: ProviderCapabilities = {
    streaming: true,
    functionCalling: true,
    multiModal: true,
    tools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'Task', 'TodoWrite'],
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    authentication: ['none', 'bearer']
  };

  async create(config: ProviderConfig): Promise<IProvider> {
    return new ClaudeCodeProvider(config);
  }

  supports(providerId: ProviderId): boolean {
    return providerId === ClaudeCodeProviderFactory.PROVIDER_ID;
  }

  getCapabilities(providerId: ProviderId): ProviderCapabilities {
    if (!this.supports(providerId)) {
      throw new Error(`Provider ${providerId} not supported`);
    }
    
    return ClaudeCodeProviderFactory.CAPABILITIES;
  }

  static getProviderId(): ProviderId {
    return ClaudeCodeProviderFactory.PROVIDER_ID;
  }
}