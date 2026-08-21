import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { Test } from "@nestjs/testing";
import type Redis from "ioredis";
import { DEFAULT_MODULE_OPTIONS, DEFAULT_STORAGE_OPTIONS } from "../../../src/config/defaults/default-options.constants";
import { MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "../../../src/di";
import { type SlidingWindowLogOptions, SlidingWindowLogRedisExecutor } from "../../../src/executors";
import { createRedisClient, MS_IN_SECOND } from "../../shared";

describe("SlidingWindowLogRedisExecutor", () => {
    let executor: SlidingWindowLogRedisExecutor;
    let redis: Redis;
    const key = "rate-limiter:sliding-window-log:key:scope";

    beforeEach(async () => {
        redis = createRedisClient();

        const module = await Test.createTestingModule({
            providers: [
                SlidingWindowLogRedisExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: redis
                },
                {
                    provide: MODULE_OPTIONS_TOKEN,
                    useValue: {
                        ...DEFAULT_MODULE_OPTIONS,
                        storage: DEFAULT_STORAGE_OPTIONS.REDIS
                    }
                }
            ]
        }).compile();

        executor = module.get(SlidingWindowLogRedisExecutor);

        await redis.flushdb();

        jest.useFakeTimers();
    });

    afterEach(async () => {
        jest.useRealTimers();

        await redis.quit();
    });

    it("should allow requests up to the limit and block further requests", async () => {
        const options: SlidingWindowLogOptions = {
            limit: 3,
            windowMs: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.limit; i++) {
            const check = await executor.check(key, options);

            expect(check).toBeTrue();
        }

        const windowOverflowCheck = await executor.check(key, options);
        expect(windowOverflowCheck).toBeFalse();

        const zcard = await redis.zcard(key);
        expect(zcard).toBe(options.limit);
    });

    it("should allow a new request as soon as the oldest request slides out of the window", async () => {
        const options: SlidingWindowLogOptions = {
            limit: 2,
            windowMs: 300
        };

        const firstCheck = await executor.check(key, options);
        expect(firstCheck).toBeTrue();

        jest.advanceTimersByTime(100);

        const secondCheck = await executor.check(key, options);
        expect(secondCheck).toBeTrue();

        const thirdCheck = await executor.check(key, options);
        expect(thirdCheck).toBeFalse();

        jest.advanceTimersByTime(210);

        const lastCheck = await executor.check(key, options);
        expect(lastCheck).toBeTrue();

        const zcard = await redis.zcard(key);
        expect(zcard).toBe(options.limit);
    });

    it("should clean up all logs if time passed is longer than windowMs", async () => {
        const options: SlidingWindowLogOptions = {
            limit: 5,
            windowMs: 100
        };

        for (let i = 0; i < options.limit; i++) {
            await executor.check(key, options);
        }

        const overflowCheck = await executor.check(key, options);
        expect(overflowCheck).toBeFalse();

        jest.advanceTimersByTime(options.windowMs + 50);

        const newCheck = await executor.check(key, options);
        expect(newCheck).toBeTrue();

        const zcard = await redis.zcard(key);
        expect(zcard).toBe(1);
    });

    it("should handle concurrent requests in the exact same millisecond thanks to salt", async () => {
        const options: SlidingWindowLogOptions = {
            limit: 10,
            windowMs: 5 * MS_IN_SECOND
        };
        const checksCount = 3;

        const parallelChecks = Array.from({ length: checksCount }).map(() => executor.check(key, options));
        const results = await Promise.all(parallelChecks);

        const expectedResults = Array.from({ length: checksCount }).map(() => true);
        expect(results).toEqual(expectedResults);

        const zcard = await redis.zcard(key);
        expect(zcard).toBe(checksCount);
    });
});
