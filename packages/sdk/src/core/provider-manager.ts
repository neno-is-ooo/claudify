import { ProviderId, ProviderConfig, ExecutionRequest, ExecutionResult } from '../types/base.js';
import { IProvider, ProviderError } from '../types/provider.js';
import { DefaultProviderRegistry } from './provider-registry.js';
import { ClaudeCodeProviderFactory } from '../providers/claude-code-factory.js';

export class ProviderManager {
  private providers = new Map<ProviderId, IProvider>();
  private registry = new DefaultProviderRegistry();

  constructor() {
    // Register default factories
    this.registry.register(ClaudeCodeProviderFactory.getProviderId(), new ClaudeCodeProviderFactory());
  }

  async addProvider(config: ProviderConfig): Promise<IProvider> {
    try {
      const factory = this.registry.getFactory(config.id);
      if (!factory) {
        throw new ProviderError(config.id, `No factory registered for provider ${config.id}`);
      }

      const provider = await factory.create(config);
      await provider.initialize(config);
      await provider.authenticate(config.auth || { type: 'none' });

      this.providers.set(config.id, provider);
      return provider;
    } catch (error) {
      throw new ProviderError(
        config.id,
        `Failed to add provider: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  hasProvider(id: ProviderId): boolean {
    return this.providers.has(id);
  }

  getProvider(id: ProviderId): IProvider | null {
    return this.providers.get(id) || null;
  }

  async executeRequest(request: ExecutionRequest): Promise<ExecutionResult> {
    // Use the first available provider (simplified for demo)
    const provider = Array.from(this.providers.values())[0];
    if (!provider) {
      throw new ProviderError('none' as ProviderId, 'No providers available');
    }

    return provider.execute(request);
  }

  async dispose(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.dispose();
    }
    this.providers.clear();
  }
}