import { beforeEach, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleOptions } from "../../../src";
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
import { MS_IN_DAY } from "../../shared";

const inMemoryOptions: RateLimiterModuleOptions = {
    storage: {
        type: "in-memory",
        gcTime: MS_IN_DAY
    }
};

const redisOptions: RateLimiterModuleOptions = {
    storage: {
        type: "redis",
        adapter: {
            eval: () => Promise.resolve(1)
        }
    }
};
const executorsMap = {
    "in-memory": [
        FixedWindowInMemoryExecutor,
        TokenBucketInMemoryExecutor,
        SlidingWindowCounterInMemoryExecutor,
        SlidingWindowLogInMemoryExecutor,
        LeakyBucketInMemoryExecutor
    ],
    redis: [FixedWindowRedisExecutor, TokenBucketRedisExecutor, SlidingWindowCounterRedisExecutor, SlidingWindowLogRedisExecutor, LeakyBucketRedisExecutor]
};

describe.each([
    ["in-memory", inMemoryOptions],
    ["redis", redisOptions]
] as const)("Executors filtration (%s storage)", (storageType, options) => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [RateLimiterModule.forRoot(options)]
        }).compile();
    });

    it("should find appropriate executors", () => {
        const validExecutors = executorsMap[storageType];

        for (const token of validExecutors) {
            const executor = module.get(token);

            expect(executor).toBeDefined();
        }
    });

    it("should not find non-appropriate executors", () => {
        const invalidExecutors = executorsMap[storageType === "in-memory" ? "redis" : "in-memory"];

        for (const token of invalidExecutors) {
            expect(() => {
                module.get(token);
            }).toThrow();
        }
    });
});
