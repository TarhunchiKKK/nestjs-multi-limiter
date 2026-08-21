import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { Test } from "@nestjs/testing";
import type Redis from "ioredis";
import { DEFAULT_STORAGE_OPTIONS, RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../src/config/defaults/default-options.constants";
import { MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "../../../src/di";
import { type LeakyBucketOptions, LeakyBucketRedisExecutor } from "../../../src/executors";
import { createRedisClient, MS_IN_SECOND } from "../../shared";

describe("LeakyBucketRedisExecutor", () => {
    let executor: LeakyBucketRedisExecutor;
    let redis: Redis;
    const key = "rate-limiter:leaky-bucket:key:scope";

    beforeEach(async () => {
        redis = createRedisClient();

        const module = await Test.createTestingModule({
            providers: [
                LeakyBucketRedisExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: redis
                },
                {
                    provide: MODULE_OPTIONS_TOKEN,
                    useValue: {
                        ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS,
                        storage: DEFAULT_STORAGE_OPTIONS.REDIS
                    }
                }
            ]
        }).compile();

        executor = module.get(LeakyBucketRedisExecutor);

        await redis.flushdb();

        jest.useFakeTimers();
    });

    afterEach(async () => {
        jest.useRealTimers();

        await redis.quit();
    });

    it("should fill the bucket up to capacity and then leak further requests", async () => {
        const options: LeakyBucketOptions = {
            capacity: 3,
            leakRate: 1 / (10 * MS_IN_SECOND),
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.capacity; i++) {
            const check = await executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = await executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should allow new request after water leaks over time", async () => {
        const options: LeakyBucketOptions = {
            capacity: 2,
            leakRate: 1 / 100,
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i <= options.capacity; i++) {
            const check = await executor.check(key, options);

            expect(check).toBe(i < options.capacity);
        }

        jest.advanceTimersByTime(110);

        const successfulCheck = await executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const blockedCheck = await executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should floor the water level at zero and not drop below", async () => {
        const options: LeakyBucketOptions = {
            capacity: 2,
            leakRate: 1,
            ttl: 5 * MS_IN_SECOND
        };

        const initialCheck = await executor.check(key, options);
        expect(initialCheck).toBeTrue();

        jest.advanceTimersByTime(10);

        for (let i = 0; i < options.capacity; i++) {
            const check = await executor.check(key, options);

            expect(check).toBe(i < options.capacity);
        }
    });

    it("should check internal Redis Hash state values", async () => {
        const options: LeakyBucketOptions = {
            capacity: 5,
            leakRate: 0.05,
            ttl: 3 * MS_IN_SECOND
        };

        // Make 1 request (water level become 1)
        await executor.check(key, options);

        const state = await redis.hmget(key, "water", "lastLeaked");

        const water = parseFloat(state[0] || "0");
        expect(water).toBe(1);

        const lastLeaked = parseInt(state[1] || "0", 10);
        expect(lastLeaked).toBeGreaterThan(0);

        const pttl = await redis.pttl(key);
        expect(pttl).toBeGreaterThan(0);
        expect(pttl).toBeLessThanOrEqual(options.ttl);
    });
});
