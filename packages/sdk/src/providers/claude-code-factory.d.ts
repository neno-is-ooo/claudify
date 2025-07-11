import { ProviderId, ProviderConfig, ProviderCapabilities } from '../types/base';
import { IProvider, ProviderFactory } from '../types/provider';
export declare class ClaudeCodeProviderFactory implements ProviderFactory {
    private static readonly PROVIDER_ID;
    private static readonly CAPABILITIES;
    create(config: ProviderConfig): Promise<IProvider>;
    supports(providerId: ProviderId): boolean;
    getCapabilities(providerId: ProviderId): ProviderCapabilities;
    static getProviderId(): ProviderId;
}
