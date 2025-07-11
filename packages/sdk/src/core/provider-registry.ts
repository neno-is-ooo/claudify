import { ProviderId, ProviderConfig } from '../types/base';
import { IProvider, ProviderFactory, ProviderRegistry, ConfigurationError } from '../types/provider';

export class DefaultProviderRegistry implements ProviderRegistry {
  private factories = new Map<ProviderId, ProviderFactory>();

  register(providerId: ProviderId, factory: ProviderFactory): void {
    this.factories.set(providerId, factory);
  }

  getFactory(providerId: ProviderId): ProviderFactory | null {
    return this.factories.get(providerId) || null;
  }

  unregister(providerId: ProviderId): void {
    this.factories.delete(providerId);
  }

  get(providerId: ProviderId): ProviderFactory | undefined {
    return this.factories.get(providerId);
  }

  list(): ProviderId[] {
    return Array.from(this.factories.keys());
  }

  async createProvider(config: ProviderConfig): Promise<IProvider> {
    const factory = this.factories.get(config.id);
    if (!factory) {
      throw new ConfigurationError(
        config.id,
        `No factory registered for provider: ${config.id}`
      );
    }

    if (!factory.supports(config.id)) {
      throw new ConfigurationError(
        config.id,
        `Factory does not support provider: ${config.id}`
      );
    }

    return factory.create(config);
  }
}