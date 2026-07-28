import { BuiltinErrorFactory } from "../../custom/error-factories";
import { BuiltinKeyExtractor } from "../../custom/key-extractors";
import { MS_IN_MINUTE } from "../../shared/lib";
import { DEFAULT_SCOPE } from "../../shared/model";
import type { RateLimiterModuleFullOptions } from "../options";

export const DEFAULT_IN_MEMORY_GC_TIME = 15 * MS_IN_MINUTE;

export const RATE_LIMITER_MODULE_DEFAULT_OPTIONS = {
    scope: DEFAULT_SCOPE,

    storage: {
        type: "in-memory",
        gcTime: DEFAULT_IN_MEMORY_GC_TIME
    },

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
