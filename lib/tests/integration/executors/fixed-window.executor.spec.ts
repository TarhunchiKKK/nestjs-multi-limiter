import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import type Redis from "ioredis";
import { STORAGE_TOKEN } from "../../../src/di";
import { type FixedWindowOptions, FixedWindowRedisExecutor } from "../../../src/executors";
import { createRedisClient, MS_IN_MINUTE, MS_IN_SECOND } from "../../shared";

describe("FixedWindowRedisExecutor", () => {
    let executor: FixedWindowRedisExecutor;
    let redis: Redis;
    const key = "rate-limiter:fixed-window:key:scope";

    beforeEach(async () => {
        redis = createRedisClient();

        const module = await Test.createTestingModule({
            providers: [
                FixedWindowRedisExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: redis
                }
            ]
        }).compile();

        executor = module.get(FixedWindowRedisExecutor);

        await redis.flushdb();
    });

    afterEach(async () => {
        await redis.quit();
    });

    it("should allow request within the limit", async () => {
        const options: FixedWindowOptions = {
            limit: 1,
            ttl: MS_IN_MINUTE
        };

        const firstCheck = await executor.check(key, options);
        expect(firstCheck).toBeTrue();

        const secondCheck = await executor.check(key, options);
        expect(secondCheck).toBeFalse();
    });

    it("should reset limit after TTL expired", async () => {
        const options: FixedWindowOptions = {
            limit: 1,
            ttl: 100
        };

        const firstCheck = await executor.check(key, options);
        expect(firstCheck).toBeTrue();

        const secondCheck = await executor.check(key, options);
        expect(secondCheck).toBeFalse();

        await Bun.sleep(150);

        const thirdCheck = await executor.check(key, options);
        expect(thirdCheck).toBeTrue();
    });

    it("should set correct PTTL in Redis for the key", async () => {
        const options: FixedWindowOptions = {
            limit: 5,
            ttl: 5 * MS_IN_SECOND
        };

        await executor.check(key, options);

        const pttl = await redis.pttl(key);

        expect(pttl).toBeGreaterThan(0);
        expect(pttl).toBeLessThanOrEqual(options.ttl);
    });
});
