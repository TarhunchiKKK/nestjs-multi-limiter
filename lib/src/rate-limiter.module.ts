import { type DynamicModule, type FactoryProvider, Module, type Provider } from "@nestjs/common";
import { mergeDefaultOptions } from "./config/defaults";
import type { RateLimiterModuleAsyncOptions, RateLimiterModuleFullOptions, RateLimiterModuleOptions, RateLimitGuardOptions } from "./config/options";
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
import { RateLimitGuard } from "./middleware";
import { InMemoryGarbageCollector } from "./services/in-memory.garbage-collector";
import { ProvidersDiscoveryService } from "./services/providers-discovery.service";
import { isProvider } from "./shared/lib";
import type { Storage } from "./shared/model";

/**
 * @publicApi
 */
@Module({
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
        ProvidersDiscoveryService,
        // QUESTION: Should this provider be exported?
        InMemoryGarbageCollector,
        RateLimitGuard
    ],
    exports: [RateLimitGuard, ProvidersDiscoveryService, GUARD_OPTIONS_TOKEN]
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

        return {
            module: RateLimiterModule,
            providers: [
                { provide: MODULE_OPTIONS_TOKEN, useValue: fullOptions },
                RateLimiterModule.getStorageProvider(fullOptions),
                { provide: GUARD_OPTIONS_TOKEN, useValue: RateLimiterModule.getGuardOptions(fullOptions) }
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
        const moduleOptionsProvider: FactoryProvider<RateLimiterModuleFullOptions> = {
            provide: MODULE_OPTIONS_TOKEN,
            inject: options.inject ?? [],
            // biome-ignore lint/suspicious/noExplicitAny: `any` type is necessary for factory customization
            useFactory: async (...args: any[]) => {
                const calculatedOptions = await options.useFactory(...args);
                return mergeDefaultOptions(calculatedOptions);
            }
        };

        const storageProvider: FactoryProvider<Storage> = {
            provide: STORAGE_TOKEN,
            inject: [MODULE_OPTIONS_TOKEN],
            useFactory: (moduleOptions: RateLimiterModuleFullOptions) => {
                if (moduleOptions.storage.type === "in-memory") {
                    return new Map();
                }

                if (isProvider(moduleOptions.storage.adapter)) {
                    throw new Error("Redis adapter provider is not initialized.");
                }

                return moduleOptions.storage.adapter;
            }
        };

        const guardOptionsProvider: FactoryProvider<RateLimitGuardOptions> = {
            provide: GUARD_OPTIONS_TOKEN,
            inject: [MODULE_OPTIONS_TOKEN],
            useFactory: (moduleOptions: RateLimiterModuleFullOptions) => RateLimiterModule.getGuardOptions(moduleOptions)
        };

        return {
            module: RateLimiterModule,
            imports: options.imports ?? [],
            providers: [moduleOptionsProvider, storageProvider, guardOptionsProvider],
            global: true
        };
    }

    private static getStorageProvider(options: RateLimiterModuleFullOptions): Provider<Storage> {
        if (options.storage.type === "in-memory") {
            return {
                provide: STORAGE_TOKEN,
                useValue: new Map()
            };
        }

        if (isProvider(options.storage.adapter)) {
            return {
                provide: STORAGE_TOKEN,
                useClass: options.storage.adapter
            };
        } else {
            return {
                provide: STORAGE_TOKEN,
                useValue: options.storage.adapter
            };
        }
    }

    private static getGuardOptions(options: RateLimiterModuleFullOptions): RateLimitGuardOptions {
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
}
