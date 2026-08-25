import { beforeEach, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule, RateLimitGuard } from "../../../src";
import { mergeDefaultOptions, type RateLimiterModuleAsyncOptions, type RateLimiterModuleFullOptions, type RateLimiterModuleOptions } from "../../../src/config";
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
import type { RateLimitGuardOptions } from "../../../src/rate-limit.guard";
import { InMemoryGarbageCollector } from "../../../src/services/in-memory.garbage-collector";
import { ProvidersResolver } from "../../../src/services/providers.resolver";
import { RATE_LIMITER_MODULE_SYNC_REDIS_OPTIONS, RateLimiterConfigModule, RateLimiterConfigService } from "../../shared";

const syncOptions: RateLimiterModuleOptions = RATE_LIMITER_MODULE_SYNC_REDIS_OPTIONS;

const asyncFactoryOptions: RateLimiterModuleAsyncOptions = {
    useFactory: () => RATE_LIMITER_MODULE_SYNC_REDIS_OPTIONS
};

const asyncClassOptions: RateLimiterModuleAsyncOptions = {
    useClass: RateLimiterConfigService
};

const asyncExistingOptions: RateLimiterModuleAsyncOptions = {
    imports: [RateLimiterConfigModule],
    useExisting: RateLimiterConfigService
};

describe.each([
    ["sync", "forRoot", syncOptions],
    ["async (useFactory)", "forRootAsync", asyncFactoryOptions],
    ["async (useClass)", "forRootAsync", asyncClassOptions],
    ["async (useExisting)", "forRootAsync", asyncExistingOptions]
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
        const nonOptionsProviders = [STORAGE_TOKEN, BuiltinKeyExtractor, BuiltinErrorFactory, ProvidersResolver, InMemoryGarbageCollector, RateLimitGuard];

        for (const token of nonOptionsProviders) {
            const provider = module.get(token);

            expect(provider).toBeDefined();
        }
    });

    it("should find all executors", () => {
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
