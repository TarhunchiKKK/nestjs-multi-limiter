import { beforeEach, describe, expect, it } from "bun:test";
import { ModulesContainer, Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleOptions, type StorageTypes, type Strategies } from "../../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../../src/config/defaults/default-options.constants";
import { ProvidersDiscoveryService } from "../../../../src/services/providers-discovery.service";
import { createRedisClient } from "../../../shared";

const strategies: Strategies[] = ["fixed-window", "token-bucket", "sliding-window-counter", "sliding-window-log", "leaky-bucket"];

describe.each<[StorageTypes, RateLimiterModuleOptions]>([
    ["in-memory", RATE_LIMITER_MODULE_DEFAULT_OPTIONS],
    ["redis", { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS, storage: "redis", instance: createRedisClient() }]
])("ProvidersDiscoveryService - executors discovery (%1 storage)", (storageType, options) => {
    let service: ProvidersDiscoveryService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [RateLimiterModule.forRoot(options)],

            // DELETE: are this providers necessary?
            providers: [ModulesContainer, Reflector]
        }).compile();

        service = module.get(ProvidersDiscoveryService);
    });

    it(`should find all executors (${storageType} storage)`, () => {
        for (const strategy of strategies) {
            const executor = service.getExecutor(strategy);

            expect(executor).toBeDefined();
            expect(executor.check).toBeFunction();
        }
    });
});
