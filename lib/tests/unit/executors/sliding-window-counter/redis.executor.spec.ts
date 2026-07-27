import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { type SlidingWindowCounterOptions, SlidingWindowCounterRedisExecutor } from "../../../../src/executors";
import { clearMock, createRedisMock, MS_IN_MINUTE } from "../../../shared";

describe("SlidingWindowCounterRedisExecutor", () => {
    let executor: SlidingWindowCounterRedisExecutor;
    const redisMock = createRedisMock();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SlidingWindowCounterRedisExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: redisMock
                }
            ]
        }).compile();

        executor = module.get(SlidingWindowCounterRedisExecutor);
    });

    afterEach(() => {
        clearMock(redisMock);
    });

    it("should allow request", async () => {
        const key = crypto.randomUUID();
        const options: SlidingWindowCounterOptions = {
            limit: 10,
            windowMs: MS_IN_MINUTE
        };

        redisMock.eval.mockResolvedValue(1);

        const result = await executor.check(key, options);

        expect(result).toBeTrue();
    });

    it("should disallow request", async () => {
        const key = crypto.randomUUID();
        const options: SlidingWindowCounterOptions = {
            limit: 10,
            windowMs: MS_IN_MINUTE
        };

        redisMock.eval.mockResolvedValue(0);

        const result = await executor.check(key, options);

        expect(result).toBeFalse();
    });
});
