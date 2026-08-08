import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleOptions, type StorageTypes, type Strategies } from "../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../src/config/defaults/default-options.constants";
import { ProvidersResolver } from "../../../src/services/providers.resolver";
import { createRedisClient } from "../../shared";

const strategies: Strategies[] = ["fixed-window", "token-bucket", "sliding-window-counter", "sliding-window-log", "leaky-bucket"];

describe.each<[StorageTypes, RateLimiterModuleOptions]>([
    ["in-memory", RATE_LIMITER_MODULE_DEFAULT_OPTIONS],
    ["redis", { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS, storage: { type: "redis", adapter: createRedisClient() } }]
])("ProvidersResolver - executors discovery (%s storage)", (storageType, options) => {
    let resolver: ProvidersResolver;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [RateLimiterModule.forRoot(options)]
        }).compile();

        resolver = module.get(ProvidersResolver);

        await module.init();
    });

    afterEach(async () => {
        await module.close();
    });

    it(`should find all executors (${storageType} storage)`, () => {
        for (const strategy of strategies) {
            const executor = resolver.getExecutor(strategy);

            expect(executor).toBeDefined();
            expect(executor.check).toBeFunction();
        }
    });
});
