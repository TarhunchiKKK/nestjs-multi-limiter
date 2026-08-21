import { afterEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { RateLimiterModule } from "../../../src";
import { type FixedWindowOptions, FixedWindowRedisExecutor } from "../../../src/executors";
import type { IRedisAdapter, RedisFailingStrategies } from "../../../src/shared/model";
import { clearMock, createRedisMock, MS_IN_DAY } from "../../shared";

const key = "rate-limiter:key:fixed-window:redis-failure";

const options: FixedWindowOptions = {
    limit: 10,
    ttl: 1 * MS_IN_DAY
};

const error = new Error("Redis disconnect");

describe("Redis failure handling", () => {
    const redisMock = createRedisMock();

    const createModule = async (redisAdapter: IRedisAdapter, failingStrategy: RedisFailingStrategies) => {
        return await Test.createTestingModule({
            imports: [
                RateLimiterModule.forRoot({
                    storage: {
                        type: "redis",
                        adapter: redisAdapter,
                        failingStrategy: failingStrategy
                    }
                })
            ]
        }).compile();
    };

    afterEach(() => {
        clearMock(redisMock);
    });

    it("should allow request", async () => {
        const module = await createModule(redisMock, "fail-open");
        const executor = module.get(FixedWindowRedisExecutor);

        redisMock.eval.mockImplementation(() => {
            throw error;
        });

        const result = await executor.check(key, options);

        expect(result).toBeTrue();
        expect(redisMock.onError).toHaveBeenCalledWith(error);
    });

    it("should block request", async () => {
        const module = await createModule(redisMock, "fail-close");
        const executor = module.get(FixedWindowRedisExecutor);

        redisMock.eval.mockImplementation(() => {
            throw error;
        });

        const result = await executor.check(key, options);

        expect(result).toBeFalse();
        expect(redisMock.onError).toHaveBeenCalledWith(error);
    });

    it("should throw error", async () => {
        const module = await createModule(redisMock, "fail-fast");
        const executor = module.get(FixedWindowRedisExecutor);

        redisMock.eval.mockImplementation(() => {
            throw error;
        });

        const resultPromise = executor.check(key, options);

        expect(resultPromise).rejects.toThrow(error);
        expect(redisMock.onError).toHaveBeenCalledWith(error);
    });
});
