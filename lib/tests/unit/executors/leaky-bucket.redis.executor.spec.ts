import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { DEFAULT_MODULE_OPTIONS, DEFAULT_STORAGE_OPTIONS } from "../../../src/config";
import { MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "../../../src/di";
import { LeakyBucketRedisExecutor } from "../../../src/executors";
import type { LeakyBucketOptions } from "../../../src/shared/model";
import { clearMock, createRedisMock, MS_IN_MINUTE } from "../../shared";

describe("LeakyBucketRedisExecutor", () => {
    let executor: LeakyBucketRedisExecutor;
    const redisMock = createRedisMock();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                LeakyBucketRedisExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: redisMock
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

        executor = module.get(LeakyBucketRedisExecutor);
    });

    afterEach(() => {
        clearMock(redisMock);
    });

    it("should allow request", async () => {
        const key = crypto.randomUUID();
        const options: LeakyBucketOptions = {
            capacity: 10,
            leakRate: 1 / MS_IN_MINUTE,
            ttl: 5 * MS_IN_MINUTE
        };

        redisMock.eval.mockResolvedValue(1);

        const result = await executor.check(key, options);

        expect(result).toBeTrue();
    });

    it("should disallow request", async () => {
        const key = crypto.randomUUID();
        const options: LeakyBucketOptions = {
            capacity: 10,
            leakRate: 1 / MS_IN_MINUTE,
            ttl: 5 * MS_IN_MINUTE
        };

        redisMock.eval.mockResolvedValue(0);

        const result = await executor.check(key, options);

        expect(result).toBeFalse();
    });
});
