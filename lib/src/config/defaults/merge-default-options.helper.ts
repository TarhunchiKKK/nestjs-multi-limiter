import { UnknownRateLimitStorageError } from "../../shared/errors";
import type { RateLimiterModuleFullOptions, RateLimiterModuleOptions, StorageOptions } from "../options";
import { DEFAULT_STORAGE_OPTIONS, RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "./default-options.constants";

export function mergeDefaultOptions(options: RateLimiterModuleOptions) {
    const storageOptions = mergeStorageOptions(options);
    return {
        scope: options.scope ?? RATE_LIMITER_MODULE_DEFAULT_OPTIONS.scope,

        storage: storageOptions,

        strategy: options.strategy ?? RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategy,
        strategyOptions: {
            fixedWindow: {
                ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.fixedWindow,
                ...options.strategyOptions?.fixedWindow
            },
            tokenBucket: {
                ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.tokenBucket,
                ...options.strategyOptions?.tokenBucket
            },
            slidingWindowCounter: {
                ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.slidingWindowCounter,
                ...options.strategyOptions?.slidingWindowCounter
            },
            slidingWindowLog: {
                ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.slidingWindowLog,
                ...options.strategyOptions?.slidingWindowLog
            },
            leakyBucket: {
                ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.leakyBucket,
                ...options.strategyOptions?.leakyBucket
            }
        },

        defaultProviders: {
            keyExtractor: options.defaultProviders?.keyExtractor ?? RATE_LIMITER_MODULE_DEFAULT_OPTIONS.defaultProviders.keyExtractor,
            errorFactory: options.defaultProviders?.errorFactory ?? RATE_LIMITER_MODULE_DEFAULT_OPTIONS.defaultProviders.errorFactory,
            optionsFactory: options.defaultProviders?.optionsFactory ?? RATE_LIMITER_MODULE_DEFAULT_OPTIONS.defaultProviders.optionsFactory
        }
    } satisfies RateLimiterModuleFullOptions;
}

function mergeStorageOptions(options: RateLimiterModuleOptions): Required<StorageOptions> {
    switch (options.storage.type) {
        case "in-memory": {
            return {
                type: "in-memory",
                gcTime: options.storage.gcTime ?? DEFAULT_STORAGE_OPTIONS.IN_MEMORY.gcTime
            };
        }
        case "redis": {
            return {
                type: "redis",
                adapter: options.storage.adapter,
                failingStrategy: options.storage.failingStrategy ?? DEFAULT_STORAGE_OPTIONS.REDIS.failingStrategy
            };
        }
        default: {
            throw new UnknownRateLimitStorageError((options.storage as { type: unknown }).type);
        }
    }
}
