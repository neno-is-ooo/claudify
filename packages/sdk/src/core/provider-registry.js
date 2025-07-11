"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultProviderRegistry = void 0;
const provider_1 = require("../types/provider");
class DefaultProviderRegistry {
    factories = new Map();
    register(providerId, factory) {
        this.factories.set(providerId, factory);
    }
    unregister(providerId) {
        this.factories.delete(providerId);
    }
    get(providerId) {
        return this.factories.get(providerId);
    }
    list() {
        return Array.from(this.factories.keys());
    }
    async createProvider(config) {
        const factory = this.factories.get(config.id);
        if (!factory) {
            throw new provider_1.ConfigurationError(config.id, `No factory registered for provider: ${config.id}`);
        }
        if (!factory.supports(config.id)) {
            throw new provider_1.ConfigurationError(config.id, `Factory does not support provider: ${config.id}`);
        }
        return factory.create(config);
    }
}
exports.DefaultProviderRegistry = DefaultProviderRegistry;
//# sourceMappingURL=provider-registry.js.map