import { UnknownRateLimitStorageError } from "../shared/errors";
import type { StorageOptions } from "./common-options.types";
import { DEFAULT_MODULE_OPTIONS, DEFAULT_STORAGE_OPTIONS } from "./default-options.constants";
import type { RateLimiterModuleFullOptions, RateLimiterModuleOptions } from "./module-options.types";

export function mergeDefaultOptions(options: RateLimiterModuleOptions) {
    const storageOptions = mergeStorageOptions(options);
    return {
        scope: options.scope ?? DEFAULT_MODULE_OPTIONS.scope,

        storage: storageOptions,

        strategy: options.strategy ?? DEFAULT_MODULE_OPTIONS.strategy,
        strategyOptions: {
            fixedWindow: {
                ...DEFAULT_MODULE_OPTIONS.strategyOptions.fixedWindow,
                ...options.strategyOptions?.fixedWindow
            },
            tokenBucket: {
                ...DEFAULT_MODULE_OPTIONS.strategyOptions.tokenBucket,
                ...options.strategyOptions?.tokenBucket
            },
            slidingWindowCounter: {
                ...DEFAULT_MODULE_OPTIONS.strategyOptions.slidingWindowCounter,
                ...options.strategyOptions?.slidingWindowCounter
            },
            slidingWindowLog: {
                ...DEFAULT_MODULE_OPTIONS.strategyOptions.slidingWindowLog,
                ...options.strategyOptions?.slidingWindowLog
            },
            leakyBucket: {
                ...DEFAULT_MODULE_OPTIONS.strategyOptions.leakyBucket,
                ...options.strategyOptions?.leakyBucket
            }
        },

        defaultProviders: {
            keyExtractor: options.defaultProviders?.keyExtractor ?? DEFAULT_MODULE_OPTIONS.defaultProviders.keyExtractor,
            errorFactory: options.defaultProviders?.errorFactory ?? DEFAULT_MODULE_OPTIONS.defaultProviders.errorFactory,
            optionsFactory: options.defaultProviders?.optionsFactory ?? DEFAULT_MODULE_OPTIONS.defaultProviders.optionsFactory
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
