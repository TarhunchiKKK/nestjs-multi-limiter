import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { Test } from "@nestjs/testing";
import type Redis from "ioredis";
import { STORAGE_TOKEN } from "../../../src/di";
import { type TokenBucketOptions, TokenBucketRedisExecutor } from "../../../src/executors";
import { createRedisClient, MS_IN_SECOND } from "../../shared";

describe("TokenBucketRedisExecutor", () => {
    let executor: TokenBucketRedisExecutor;
    let redis: Redis;
    const key = "rate-limiter:token-bucket:key:scope";

    beforeEach(async () => {
        redis = createRedisClient();

        const module = await Test.createTestingModule({
            providers: [
                TokenBucketRedisExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: redis
                }
            ]
        }).compile();

        executor = module.get(TokenBucketRedisExecutor);

        await redis.flushdb();

        jest.useFakeTimers();
    });

    afterEach(async () => {
        jest.useRealTimers();

        await redis.quit();
    });

    it("should consume tokens down to 0 and then block request", async () => {
        const options: TokenBucketOptions = {
            capacity: 3,
            refillRate: 1 / MS_IN_SECOND,
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.capacity; i++) {
            const check = await executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = await executor.check(key, options);

        expect(blockedCheck).toBeFalse();
    });

    it("should refill tokens incrementally based on elapsed time", async () => {
        const options: TokenBucketOptions = {
            capacity: 2,
            refillRate: 1 / 100,
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i <= options.capacity; i++) {
            const check = await executor.check(key, options);

            expect(check).toBe(i < options.capacity);
        }

        jest.advanceTimersByTime(150);

        const successfulCheck = await executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const blockedCheck = await executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should not accumulate tokens beyond maximum capacity", async () => {
        const options: TokenBucketOptions = {
            capacity: 2,
            refillRate: 1,
            ttl: 5 * MS_IN_SECOND
        };

        const initialCheck = await executor.check(key, options);
        expect(initialCheck).toBeTrue();

        jest.advanceTimersByTime(10 * options.refillRate);

        for (let i = 0; i <= options.capacity; i++) {
            const check = await executor.check(key, options);

            expect(check).toBe(i < options.capacity);
        }
    });

    it("should check structure and data stored inside Redis Hash-table", async () => {
        const options: TokenBucketOptions = {
            capacity: 5,
            refillRate: 1 / 10,
            ttl: 2 * MS_IN_SECOND
        };

        const initialCheck = await executor.check(key, options);
        expect(initialCheck).toBeTrue();

        const state = await redis.hmget(key, "tokens", "lastRefilled");

        const tokens = parseFloat(state[0] || "0");
        const lastRefilled = parseInt(state[1] || "0", 10);

        expect(tokens).toBe(options.capacity - 1);
        expect(lastRefilled).toBeGreaterThan(0);

        const pttl = await redis.pttl(key);
        expect(pttl).toBeGreaterThan(0);
        expect(pttl).toBeLessThanOrEqual(options.ttl);
    });
});
