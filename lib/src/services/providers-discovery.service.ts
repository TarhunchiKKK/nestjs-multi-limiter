import { Inject, Injectable, type InjectionToken, type OnModuleInit } from "@nestjs/common";
import { ModulesContainer, Reflector } from "@nestjs/core";
import type { RateLimiterModuleOptions } from "../config/options";
import { ERROR_FACTORY_METADATA, type IErrorFactory } from "../custom/error-factories";
import { type IKeyExtractor, KEY_EXTRACTOR_METADATA } from "../custom/key-extractors";
import { type IOptionsFactory, OPTIONS_FACTORY_METADATA } from "../custom/options-factories";
import { MODULE_OPTIONS_TOKEN } from "../di";
import { type AllStrategiesOptions, EXECUTOR_METADATA_KEY, type ExecutorMetadata, type IExecutor } from "../executors";
import type { Strategies } from "../shared/model";

// DELETE: Is this class necessary?
@Injectable()
export class ProvidersDiscoveryService implements OnModuleInit {
    private readonly executorsMap = new Map<Strategies, IExecutor<unknown>>();
    private readonly keyExtractorsMap = new Map<InjectionToken, IKeyExtractor>();
    private readonly errorFactoriesMap = new Map<InjectionToken, IErrorFactory>();
    private readonly optionsFactoriesMap = new Map<InjectionToken, IOptionsFactory>();

    public constructor(
        @Inject(ModulesContainer) private readonly modulesContainer: ModulesContainer,
        @Inject(Reflector) private readonly reflector: Reflector,
        @Inject(MODULE_OPTIONS_TOKEN) private readonly moduleOptions: RateLimiterModuleOptions
    ) {}

    public getExecutor<Strategy extends Strategies>(strategy: Strategy) {
        const executor = this.executorsMap.get(strategy);

        if (!executor) {
            throw new Error(`No executor found for strategy: "${strategy}""`);
        }

        return executor as IExecutor<AllStrategiesOptions[Strategy]>;
    }

    public getKeyExtractor(token: InjectionToken) {
        const keyExtractor = this.keyExtractorsMap.get(token);

        if (!keyExtractor) {
            throw new Error(`No key extractor found for token: ${String(token)}`);
        }

        return keyExtractor;
    }

    public getErrorFactory(token: InjectionToken) {
        const errorFactory = this.errorFactoriesMap.get(token);

        if (!errorFactory) {
            throw new Error(`No error factory found for token: ${String(token)}`);
        }

        return errorFactory;
    }

    public getOptionsFactory(token: InjectionToken) {
        const optionsFactory = this.optionsFactoriesMap.get(token);

        if (!optionsFactory) {
            throw new Error(`No options factory found for token: ${String(token)}`);
        }

        return optionsFactory;
    }

    public onModuleInit() {
        for (const moduleInstance of this.modulesContainer.values()) {
            for (const provider of moduleInstance.providers.values()) {
                const token = provider.token;
                const adapter = provider.instance;

                if (!adapter) {
                    continue;
                }

                if (this.isValidProvider<IExecutor<unknown>>(adapter, "check", EXECUTOR_METADATA_KEY)) {
                    const metadata = this.reflector.get<ExecutorMetadata>(EXECUTOR_METADATA_KEY, adapter.constructor);

                    if (metadata && metadata.storage === this.moduleOptions.storage.type) {
                        this.executorsMap.set(metadata.strategy, adapter);
                    }
                }

                if (this.isValidProvider<IKeyExtractor>(adapter, "extract", KEY_EXTRACTOR_METADATA)) {
                    this.keyExtractorsMap.set(token, adapter);
                }

                if (this.isValidProvider<IErrorFactory>(adapter, "getError", ERROR_FACTORY_METADATA)) {
                    this.errorFactoriesMap.set(token, adapter);
                }

                if (this.isValidProvider<IOptionsFactory>(adapter, "getOptions", OPTIONS_FACTORY_METADATA)) {
                    this.optionsFactoriesMap.set(token, adapter);
                }
            }
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: `any` type is necessary for safe casting from `unknown` type
    private isValidProvider<T>(provider: any, methodKey: keyof T, metadataKey: string): provider is T {
        if (!provider?.constructor) {
            return false;
        }

        const hasMethod = methodKey in provider && typeof provider[methodKey] === "function";

        const hasMetadata = this.reflector.get(metadataKey, provider.constructor);

        return hasMethod && hasMetadata;
    }
}
