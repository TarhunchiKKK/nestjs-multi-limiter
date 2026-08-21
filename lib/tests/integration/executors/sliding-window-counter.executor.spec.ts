import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { Test } from "@nestjs/testing";
import type Redis from "ioredis";
import { DEFAULT_STORAGE_OPTIONS, RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../src/config/defaults/default-options.constants";
import { MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "../../../src/di";
import { type SlidingWindowCounterOptions, SlidingWindowCounterRedisExecutor } from "../../../src/executors";
import { createRedisClient, MS_IN_SECOND } from "../../shared";

describe("SlidingWindowCounterRedisExecutor", () => {
    let executor: SlidingWindowCounterRedisExecutor;
    let redis: Redis;
    const key = "rate-limiter:sliding-window-counter:key:scope";

    beforeEach(async () => {
        redis = createRedisClient();

        const module = await Test.createTestingModule({
            providers: [
                SlidingWindowCounterRedisExecutor,
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

        executor = module.get(SlidingWindowCounterRedisExecutor);

        await redis.flushdb();

        jest.useFakeTimers();
    });

    afterEach(async () => {
        jest.useRealTimers();

        await redis.flushdb();
    });

    it("should allow request up to the limit within the same window", async () => {
        const options: SlidingWindowCounterOptions = {
            limit: 2,
            windowMs: MS_IN_SECOND
        };

        for (let i = 0; i < options.limit; i++) {
            const check = await executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = await executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    // FIX: flaking test
    it.skip("should dynamically decay previous window weight as time progresses", async () => {
        const options: SlidingWindowCounterOptions = {
            limit: 2,
            windowMs: 200
        };

        for (let i = 0; i <= options.limit; i++) {
            const check = await executor.check(key, options);

            expect(check).toBe(i < options.limit);
        }

        jest.advanceTimersByTime(options.windowMs + 20);

        const successfulCheck = await executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const blockedCheck = await executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should shift windows correctly when time gap is exactly 1 window length", async () => {
        const options: SlidingWindowCounterOptions = {
            limit: 1,
            windowMs: 100
        };

        const initialCheck = await executor.check(key, options);
        expect(initialCheck).toBeTrue();

        jest.advanceTimersByTime(options.windowMs + 10);

        // Lua-script should execute branch: if timePassed == windowMs
        await executor.check(key, options);

        const state = await redis.hmget(key, "currentCount", "previousCount");
        expect(parseInt(state[0] as string, 10)).toBe(1); // Current window has only 1 request
        expect(parseInt(state[1] as string, 10)).toBe(0); // Old window go to `previousCount`
    });

    it("should completely clear counts if more than 1 window passed", async () => {
        const options: SlidingWindowCounterOptions = {
            limit: 5,
            windowMs: 100
        };

        const initialCheck = await executor.check(key, options);
        expect(initialCheck).toBeTrue();

        jest.advanceTimersByTime(options.windowMs * 2 + 50);

        // Result should be calculated without old data
        const check = await executor.check(key, options);
        expect(check).toBeTrue();

        const state = await redis.hmget(key, "currentCount", "previousCount");
        expect(parseInt(state[0] as string, 10)).toBe(1); // New single request
        expect(parseInt(state[1] as string, 10)).toBe(0); // Previous data cleared
    });

    it("should check that redis key TTL is set to double windowMs", async () => {
        const options: SlidingWindowCounterOptions = {
            limit: 5,
            windowMs: 3 * MS_IN_SECOND
        };

        await executor.check(key, options);

        const pttl = await redis.pttl(key);

        expect(pttl).toBeGreaterThan(0);
        expect(pttl).toBeLessThanOrEqual(options.windowMs * 2);
    });
});
