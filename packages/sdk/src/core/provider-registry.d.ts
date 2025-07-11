import { ProviderId, ProviderConfig } from '../types/base';
import { IProvider, ProviderFactory, ProviderRegistry } from '../types/provider';
export declare class DefaultProviderRegistry implements ProviderRegistry {
    private factories;
    register(providerId: ProviderId, factory: ProviderFactory): void;
    unregister(providerId: ProviderId): void;
    get(providerId: ProviderId): ProviderFactory | undefined;
    list(): ProviderId[];
    createProvider(config: ProviderConfig): Promise<IProvider>;
}
