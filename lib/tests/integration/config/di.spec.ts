import { beforeEach, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule, RateLimitGuard } from "../../../src";
import { mergeDefaultOptions } from "../../../src/config/defaults";
import type { RateLimiterModuleAsyncOptions, RateLimiterModuleFullOptions, RateLimiterModuleOptions, RateLimitGuardOptions } from "../../../src/config/options";
import { BuiltinErrorFactory } from "../../../src/custom/error-factories";
import { BuiltinKeyExtractor } from "../../../src/custom/key-extractors";
import { GUARD_OPTIONS_TOKEN, MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "../../../src/di";
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
} from "../../../src/executors";
import { InMemoryGarbageCollector } from "../../../src/services/in-memory.garbage-collector";
import { ProvidersDiscoveryService } from "../../../src/services/providers-discovery.service";

const syncOptions: RateLimiterModuleOptions = {
    storage: {
        type: "redis",
        adapter: {
            eval: () => Promise.resolve(1)
        }
    }
};

const asyncOptions: RateLimiterModuleAsyncOptions = {
    imports: [],
    inject: [],
    useFactory: () => syncOptions
};

describe.each([
    ["sync", "forRoot", syncOptions],
    ["async", "forRootAsync", asyncOptions]
])("Dependency injection (%s configuration)", (_, method, options) => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [RateLimiterModule[method](options)]
        }).compile();
    });

    it("should inject valid module options", () => {
        const moduleOptions = module.get(MODULE_OPTIONS_TOKEN);

        const expectedOptions = mergeDefaultOptions(syncOptions);

        expect(moduleOptions).toEqual(expectedOptions);
    });

    it("should inject valid guard options", () => {
        const guardOptions: RateLimitGuardOptions = module.get(GUARD_OPTIONS_TOKEN);
        const moduleOptions: RateLimiterModuleFullOptions = module.get(MODULE_OPTIONS_TOKEN);

        expect(guardOptions.scope).toBe(moduleOptions.scope);
        expect(guardOptions.strategy).toBe(moduleOptions.strategy);

        expect(guardOptions.strategyOptions["fixed-window"]).toEqual(moduleOptions.strategyOptions.fixedWindow);
        expect(guardOptions.strategyOptions["token-bucket"]).toEqual(moduleOptions.strategyOptions.tokenBucket);
        expect(guardOptions.strategyOptions["sliding-window-counter"]).toEqual(moduleOptions.strategyOptions.slidingWindowCounter);
        expect(guardOptions.strategyOptions["sliding-window-log"]).toEqual(moduleOptions.strategyOptions.slidingWindowLog);
        expect(guardOptions.strategyOptions["leaky-bucket"]).toEqual(moduleOptions.strategyOptions.leakyBucket);

        expect(guardOptions.keyExtractor).toBe(moduleOptions.defaultProviders.keyExtractor);
        expect(guardOptions.errorFactory).toBe(moduleOptions.defaultProviders.errorFactory);
        expect(guardOptions.factory).toBe(moduleOptions.defaultProviders.optionsFactory);
    });

    it("should inject non-options providers", () => {
        const nonOptionsProviders = [
            STORAGE_TOKEN,
            BuiltinKeyExtractor,
            BuiltinErrorFactory,
            ProvidersDiscoveryService,
            InMemoryGarbageCollector,
            RateLimitGuard
        ];

        for (const token of nonOptionsProviders) {
            const provider = module.get(token);

            expect(provider).toBeDefined();
        }
    });

    it("should find appropriate executors", () => {
        const executors = [
            FixedWindowInMemoryExecutor,
            TokenBucketInMemoryExecutor,
            SlidingWindowCounterInMemoryExecutor,
            SlidingWindowLogInMemoryExecutor,
            LeakyBucketInMemoryExecutor,
            FixedWindowRedisExecutor,
            TokenBucketRedisExecutor,
            SlidingWindowCounterRedisExecutor,
            SlidingWindowLogRedisExecutor,
            LeakyBucketRedisExecutor
        ];

        for (const token of executors) {
            const executor = module.get(token);

            expect(executor).toBeDefined();
        }
    });
});
