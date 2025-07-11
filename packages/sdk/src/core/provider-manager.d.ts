import { ProviderId, ProviderConfig, ExecutionRequest, ExecutionResult } from '../types/base';
import { IProvider, ProviderManager, ProviderRegistry } from '../types/provider';
export declare class DefaultProviderManager implements ProviderManager {
    private registry;
    private providers;
    constructor(registry: ProviderRegistry);
    addProvider(config: ProviderConfig): Promise<IProvider>;
    removeProvider(providerId: ProviderId): Promise<void>;
    getProvider(providerId: ProviderId): IProvider | undefined;
    listProviders(): IProvider[];
    executeWithProvider(providerId: ProviderId, request: ExecutionRequest): Promise<ExecutionResult>;
    executeWithBest(request: ExecutionRequest): Promise<ExecutionResult>;
}
