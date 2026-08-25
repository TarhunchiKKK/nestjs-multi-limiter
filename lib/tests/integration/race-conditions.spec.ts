import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import type Redis from "ioredis";
import { DEFAULT_MODULE_OPTIONS, DEFAULT_STORAGE_OPTIONS } from "../../src/config/default-options.constants";
import { MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "../../src/di";
import { FixedWindowRedisExecutor } from "../../src/executors";
import type { FixedWindowOptions } from "../../src/shared/model";
import { createRedisClient, MS_IN_SECOND } from "../shared";

describe("Race Conditions", () => {
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

        executor = module.get(FixedWindowRedisExecutor);

        await redis.flushdb();
    });

    afterEach(async () => {
        await redis.quit();
    });

    it("should handle strict race conditions with concurrent requests", async () => {
        const options: FixedWindowOptions = {
            limit: 5,
            ttl: 10 * MS_IN_SECOND
        };
        const totalRequests = 30;

        const checks = Array.from({ length: totalRequests }).map(() => executor.check(key, options));
        const results = await Promise.all(checks);

        const allowedRequests = results.filter((result) => result === true);
        expect(allowedRequests.length).toBe(options.limit);

        const blockedRequests = results.filter((result) => result === false);
        expect(blockedRequests.length).toBe(totalRequests - options.limit);
    });
});
