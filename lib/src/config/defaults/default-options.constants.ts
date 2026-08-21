import { BuiltinErrorFactory } from "../../custom/error-factories";
import { BuiltinKeyExtractor } from "../../custom/key-extractors";
import { MS_IN_MINUTE } from "../../shared/lib";
import { DEFAULT_SCOPE } from "../../shared/model";
import type { RateLimiterModuleFullOptions, StorageOptions } from "../options";

export const DEFAULT_STORAGE_OPTIONS = {
    IN_MEMORY: {
        type: "in-memory",
        gcTime: 15 * MS_IN_MINUTE
    } satisfies StorageOptions,
    REDIS: {
        type: "redis",
        failingStrategy: "fail-open"
    } satisfies Partial<StorageOptions>
};

export const DEFAULT_MODULE_OPTIONS = {
    scope: DEFAULT_SCOPE,
    storage: DEFAULT_STORAGE_OPTIONS.IN_MEMORY,
    strategy: "fixed-window",
    strategyOptions: {
        fixedWindow: {
            limit: 100,
            ttl: MS_IN_MINUTE
        },
        slidingWindowCounter: {
            limit: 100,
            windowMs: MS_IN_MINUTE
        },
        slidingWindowLog: {
            limit: 50,
            windowMs: MS_IN_MINUTE
        },
        tokenBucket: {
            capacity: 20,
            refillRate: 5 / MS_IN_MINUTE,
            ttl: 3 * MS_IN_MINUTE
        },
        leakyBucket: {
            capacity: 10,
            leakRate: 2 / MS_IN_MINUTE,
            ttl: 3 * MS_IN_MINUTE
        }
    },
    defaultProviders: {
        keyExtractor: BuiltinKeyExtractor,
        errorFactory: BuiltinErrorFactory,
        optionsFactory: undefined
    }
} satisfies RateLimiterModuleFullOptions;
