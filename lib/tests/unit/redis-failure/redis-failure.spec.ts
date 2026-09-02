import { afterEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { RateLimiterModule } from "../../../src";
import { FixedWindowRedisExecutor } from "../../../src/executors";
import type { FixedWindowOptions, IRedisAdapter, RedisFailingStrategies } from "../../../src/shared/model";
import { clearMock, createRedisMock, MS_IN_DAY } from "../../shared";
import { RedisAdapterError } from "../../../src/shared/errors";

const key = "rate-limiter:key:fixed-window:redis-failure";

const options: FixedWindowOptions = {
    limit: 10,
    ttl: 1 * MS_IN_DAY
};

const redisAdapterError = new RedisAdapterError();
const unknownError = new Error("Redis disconnect");

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

    it('should correctly apply "fail-open" strategy', async () => {
        const module = await createModule(redisMock, "fail-open");
        const executor = module.get(FixedWindowRedisExecutor);

        redisMock.eval.mockImplementation(() => {
            throw redisAdapterError;
        });

        const result = await executor.check(key, options);

        expect(result).toBeTrue();
        expect(redisMock.handleError).not.toHaveBeenCalled();
    });

    it('should correctly apply "fail-close" strategy', async () => {
        const module = await createModule(redisMock, "fail-close");
        const executor = module.get(FixedWindowRedisExecutor);

        redisMock.eval.mockImplementation(() => {
            throw redisAdapterError;
        });

        const result = await executor.check(key, options);

        expect(result).toBeFalse();
        expect(redisMock.handleError).not.toHaveBeenCalled();
    });

    it('should correctly apply "fail-fast" strategy', async () => {
        const module = await createModule(redisMock, "fail-fast");
        const executor = module.get(FixedWindowRedisExecutor);

        redisMock.eval.mockImplementation(() => {
            throw redisAdapterError;
        });

        const resultPromise = executor.check(key, options);

        expect(resultPromise).rejects.toThrow(redisAdapterError);
        expect(redisMock.handleError).not.toHaveBeenCalled();
    });

    it("should handle unknown error", async () => {
        const module = await createModule(redisMock, "fail-fast");
        const executor = module.get(FixedWindowRedisExecutor);

        redisMock.eval.mockImplementation(() => {
            throw unknownError;
        });

        const resultPromise = executor.check(key, options);

        expect(resultPromise).rejects.toThrow(unknownError);
        expect(redisMock.handleError).toHaveBeenCalledWith(unknownError, key);
    });
});
