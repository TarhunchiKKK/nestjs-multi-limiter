import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { DEFAULT_MODULE_OPTIONS, DEFAULT_STORAGE_OPTIONS } from "../../../src/config/default-options.constants";
import { MODULE_OPTIONS_TOKEN, STORAGE_TOKEN } from "../../../src/di";
import { SlidingWindowLogRedisExecutor } from "../../../src/executors";
import type { SlidingWindowLogOptions } from "../../../src/shared/model";
import { clearMock, createRedisMock, MS_IN_DAY } from "../../shared";

describe("SlidingWindowLogRedisExecutor", () => {
    let executor: SlidingWindowLogRedisExecutor;
    const redisMock = createRedisMock();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SlidingWindowLogRedisExecutor,
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

        executor = module.get(SlidingWindowLogRedisExecutor);
    });

    afterEach(() => {
        clearMock(redisMock);
    });

    it("should allow request", async () => {
        const key = crypto.randomUUID();
        const options: SlidingWindowLogOptions = {
            limit: 100,
            windowMs: MS_IN_DAY
        };

        redisMock.eval.mockResolvedValue(1);

        const result = await executor.check(key, options);

        expect(result).toBeTrue();
    });

    it("should disallow request", async () => {
        const key = crypto.randomUUID();
        const options: SlidingWindowLogOptions = {
            limit: 100,
            windowMs: MS_IN_DAY
        };

        redisMock.eval.mockResolvedValue(0);

        const result = await executor.check(key, options);

        expect(result).toBeFalse();
    });
});
