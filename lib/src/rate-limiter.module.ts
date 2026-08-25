import { type DynamicModule, type FactoryProvider, Module, type Provider } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { mergeDefaultOptions } from "./config/defaults";
import { validateModuleOptions } from "./config/helpers";
import type { IRateLimiterModuleOptionsFactory, RateLimiterModuleAsyncOptions, RateLimiterModuleFullOptions, RateLimiterModuleOptions } from "./config/options";
import { BuiltinErrorFactory } from "./custom/error-factories";
import { BuiltinKeyExtractor } from "./custom/key-extractors";
import { GUARD_OPTIONS_TOKEN, MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "./di";
import {
    FixedWindowInMemoryExecutor,
    FixedWindowRedisExecutor,
    LeakyBucketInMemoryExecutor,
    LeakyBucketRedisExecutor,
    SlidingWindowCounterInMemoryExecutor,
    SlidingWindowCounterRedisExecutor,
    SlidingWindowLogInMemoryExecutor,
    SlidingWindowLogRedisExecutor,
    TokenBucketInMemoryExecutor,
    TokenBucketRedisExecutor
} from "./executors";
import { RateLimitGuard, type RateLimitGuardOptions } from "./rate-limit.guard";
import { InMemoryGarbageCollector } from "./services/in-memory.garbage-collector";
import { ProvidersResolver } from "./services/providers.resolver";
import { InvalidAsyncConfigurationError } from "./shared/errors";
import type { Storage } from "./shared/model";

/**
 * @publicApi
 */
@Module({
    imports: [DiscoveryModule],
    providers: [
        FixedWindowInMemoryExecutor,
        FixedWindowRedisExecutor,
        TokenBucketInMemoryExecutor,
        TokenBucketRedisExecutor,
        SlidingWindowCounterInMemoryExecutor,
        SlidingWindowCounterRedisExecutor,
        SlidingWindowLogInMemoryExecutor,
        SlidingWindowLogRedisExecutor,
        LeakyBucketInMemoryExecutor,
        LeakyBucketRedisExecutor,
        BuiltinKeyExtractor,
        BuiltinErrorFactory,
        ProvidersResolver,
        InMemoryGarbageCollector,
        RateLimitGuard
    ],
    exports: [RateLimitGuard, ProvidersResolver, GUARD_OPTIONS_TOKEN]
})
export class RateLimiterModule {
    /**
     * Sync module configuration.
     *
     * @param options Default rate limiting options.
     * @returns Module.
     */
    public static forRoot(options: RateLimiterModuleOptions): DynamicModule {
        const fullOptions = mergeDefaultOptions(options);

        validateModuleOptions(fullOptions);

        return {
            module: RateLimiterModule,
            providers: [
                { provide: MODULE_OPTIONS_TOKEN, useValue: fullOptions },
                { provide: STORAGE_TOKEN, useValue: options.storage.type === "redis" ? options.storage.adapter : new Map() },
                { provide: GUARD_OPTIONS_TOKEN, useValue: RateLimiterModule.createGuardOptions(fullOptions) }
            ],
            global: true
        };
    }

    /**
     * Async module configuration.
     *
     * @param options Dynamic default rate limiting options.
     * @returns Module.
     */
    public static forRootAsync(options: RateLimiterModuleAsyncOptions): DynamicModule {
        const moduleOptionsProviders = RateLimiterModule.createAsyncOptionsProviders(options);

        const storageProvider: FactoryProvider<Storage> = {
            provide: STORAGE_TOKEN,
            inject: [MODULE_OPTIONS_TOKEN],
            useFactory: (moduleOptions: RateLimiterModuleFullOptions) => {
                if (moduleOptions.storage.type === "in-memory") {
                    return new Map();
                }

                return moduleOptions.storage.adapter;
            }
        };

        const guardOptionsProvider: FactoryProvider<RateLimitGuardOptions> = {
            provide: GUARD_OPTIONS_TOKEN,
            inject: [MODULE_OPTIONS_TOKEN],
            useFactory: (moduleOptions: RateLimiterModuleFullOptions) => RateLimiterModule.createGuardOptions(moduleOptions)
        };

        return {
            module: RateLimiterModule,
            imports: options.imports ?? [],
            providers: [...moduleOptionsProviders, storageProvider, guardOptionsProvider],
            global: true
        };
    }

    private static createGuardOptions(options: RateLimiterModuleFullOptions): RateLimitGuardOptions {
        return {
            scope: options.scope,
            strategy: options.strategy,
            strategyOptions: {
                "fixed-window": options.strategyOptions.fixedWindow,
                "token-bucket": options.strategyOptions.tokenBucket,
                "sliding-window-counter": options.strategyOptions.slidingWindowCounter,
                "sliding-window-log": options.strategyOptions.slidingWindowLog,
                "leaky-bucket": options.strategyOptions.leakyBucket
            },
            keyExtractor: options.defaultProviders.keyExtractor,
            errorFactory: options.defaultProviders.errorFactory,
            factory: options.defaultProviders.optionsFactory
        };
    }

    private static createAsyncOptionsProviders(options: RateLimiterModuleAsyncOptions): Provider[] {
        if (!(options.useFactory || options.useClass || options.useExisting)) {
            throw new InvalidAsyncConfigurationError();
        }

        // FIX: Remove `!` operator from this method.
        if (options.useFactory) {
            return [
                {
                    provide: MODULE_OPTIONS_TOKEN,
                    inject: options.inject ?? [],
                    // biome-ignore lint/suspicious/noExplicitAny: `any` type is necessary for factory customization
                    useFactory: async (...args: any[]) => {
                        // biome-ignore lint/style/noNonNullAssertion: `useFactory` field will be defined
                        const calculatedOptions = await options.useFactory!(...args);

                        const fullOptions = mergeDefaultOptions(calculatedOptions);

                        validateModuleOptions(fullOptions);

                        return fullOptions;
                    }
                }
            ];
        }

        const configProvider: Provider = {
            provide: MODULE_OPTIONS_TOKEN,
            // biome-ignore lint/style/noNonNullAssertion: One of this fields will be provided
            inject: [(options.useClass ?? options.useExisting)!],
            useFactory: async (optionsFactory: IRateLimiterModuleOptionsFactory) => {
                const calculatedOptions = await optionsFactory.createRateLimiterModuleOptions();

                const fullOptions = mergeDefaultOptions(calculatedOptions);

                validateModuleOptions(fullOptions);

                return fullOptions;
            }
        };

        if (options.useClass) {
            return [
                configProvider,
                {
                    provide: options.useClass,
                    useClass: options.useClass
                }
            ];
        }

        return [configProvider];
    }
}
