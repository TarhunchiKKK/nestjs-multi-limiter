import { Inject, Injectable, type InjectionToken, type OnModuleInit } from "@nestjs/common";
import { DiscoveryService, ModuleRef, Reflector } from "@nestjs/core";
import type { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import type { RateLimiterModuleOptions } from "../config/options";
import { ERROR_FACTORY_METADATA, type IErrorFactory } from "../custom/error-factories";
import { type IKeyExtractor, KEY_EXTRACTOR_METADATA } from "../custom/key-extractors";
import { type IOptionsFactory, OPTIONS_FACTORY_METADATA } from "../custom/options-factories";
import { MODULE_OPTIONS_TOKEN } from "../di";
import { type AllStrategiesOptions, EXECUTOR_METADATA_KEY, type ExecutorMetadata, type IExecutor } from "../executors";
import type { Strategies } from "../shared/model";

@Injectable()
export class ProvidersResolver implements OnModuleInit {
    private readonly executorsMap = new Map<Strategies, IExecutor<unknown>>();
    private readonly keyExtractorsMap = new Map<InjectionToken, InstanceWrapper<IKeyExtractor>>();
    private readonly errorFactoriesMap = new Map<InjectionToken, InstanceWrapper<IErrorFactory>>();
    private readonly optionsFactoriesMap = new Map<InjectionToken, InstanceWrapper<IOptionsFactory>>();

    public constructor(
        @Inject(DiscoveryService) private readonly discoveryService: DiscoveryService,
        @Inject(ModuleRef) private readonly moduleRef: ModuleRef,
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

    public async getKeyExtractor(token: InjectionToken): Promise<IKeyExtractor> {
        const wrapper = this.keyExtractorsMap.get(token);

        if (!wrapper) {
            throw new Error(`No key extractor found for token: ${String(token)}`);
        }

        return await this.resolveCustomProvider(token, wrapper);
    }

    public async getErrorFactory(token: InjectionToken): Promise<IErrorFactory> {
        const wrapper = this.errorFactoriesMap.get(token);

        if (!wrapper) {
            throw new Error(`No error factory found for token: ${String(token)}`);
        }

        return await this.resolveCustomProvider(token, wrapper);
    }

    public async getOptionsFactory(token: InjectionToken): Promise<IOptionsFactory> {
        const wrapper = this.optionsFactoriesMap.get(token);

        if (!wrapper) {
            throw new Error(`No options factory found for token: ${String(token)}`);
        }

        return await this.resolveCustomProvider(token, wrapper);
    }

    private async resolveCustomProvider<T>(token: InjectionToken, wrapper: InstanceWrapper<T>): Promise<T> {
        if (wrapper.isDependencyTreeStatic()) {
            // For static provider
            return wrapper.instance;
        }

        // For request scoped provider
        return await this.moduleRef.resolve<T>(token, undefined, { strict: false });
    }

    public onModuleInit() {
        const providers = this.discoveryService.getProviders();

        for (const wrapper of providers) {
            if (!wrapper.instance) {
                continue;
            }

            if (this.isValidProvider<IExecutor<unknown>>(wrapper.instance, "check", EXECUTOR_METADATA_KEY)) {
                const metadata = this.reflector.get<ExecutorMetadata>(EXECUTOR_METADATA_KEY, wrapper.instance.constructor);

                if (metadata && metadata.storage === this.moduleOptions.storage.type) {
                    // FIX: type casting
                    this.executorsMap.set(metadata.strategy, wrapper.instance as unknown as IExecutor<unknown>);
                }
            }

            if (this.isValidProvider<IKeyExtractor>(wrapper.instance, "extract", KEY_EXTRACTOR_METADATA)) {
                this.keyExtractorsMap.set(wrapper.token, wrapper);
            }

            if (this.isValidProvider<IErrorFactory>(wrapper.instance, "getError", ERROR_FACTORY_METADATA)) {
                this.errorFactoriesMap.set(wrapper.token, wrapper);
            }

            if (this.isValidProvider<IOptionsFactory>(wrapper.instance, "getOptions", OPTIONS_FACTORY_METADATA)) {
                this.optionsFactoriesMap.set(wrapper.token, wrapper);
            }
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: `any` type is necessary for safe casting from `unknown` type
    private isValidProvider<T>(provider: any, methodKey: keyof T, metadataKey: string): provider is InstanceWrapper<T> {
        if (!provider?.constructor) {
            return false;
        }

        const hasMethod = methodKey in provider && typeof provider[methodKey] === "function";

        const hasMetadata = this.reflector.get(metadataKey, provider.constructor);

        return hasMethod && hasMetadata;
    }
}
