"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultProviderManager = void 0;
class DefaultProviderManager {
    registry;
    providers = new Map();
    constructor(registry) {
        this.registry = registry;
    }
    async addProvider(config) {
        const provider = await this.registry.createProvider(config);
        await provider.initialize(config);
        this.providers.set(config.id, provider);
        return provider;
    }
    async removeProvider(providerId) {
        const provider = this.providers.get(providerId);
        if (provider) {
            await provider.dispose();
            this.providers.delete(providerId);
        }
    }
    getProvider(providerId) {
        return this.providers.get(providerId);
    }
    listProviders() {
        return Array.from(this.providers.values());
    }
    async executeWithProvider(providerId, request) {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new Error(`Provider not found: ${providerId}`);
        }
        return provider.execute(request);
    }
    async executeWithBest(request) {
        const providers = Array.from(this.providers.values());
        if (providers.length === 0) {
            throw new Error('No providers available');
        }
        // Simple strategy: use the first healthy provider
        for (const provider of providers) {
            if (await provider.isHealthy()) {
                return provider.execute(request);
            }
        }
        throw new Error('No healthy providers available');
    }
}
exports.DefaultProviderManager = DefaultProviderManager;
//# sourceMappingURL=provider-manager.js.map