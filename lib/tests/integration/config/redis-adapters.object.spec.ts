import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { type IRedisAdapter, RateLimiterModule } from "../../../src";
import { type FixedWindowOptions, FixedWindowRedisExecutor } from "../../../src/executors";
import { IoRedisClient, MS_IN_MINUTE } from "../../shared";

const createSyncOptions = (adapter: IRedisAdapter) => ({
    storage: {
        type: "redis",
        adapter: adapter
    }
});

const createAsyncOptions = (adapter: IRedisAdapter) => ({
    useFactory: () => createSyncOptions(adapter)
});

describe.each([
    ["sync", "forRoot", createSyncOptions],
    ["async", "forRootAsync", createAsyncOptions]
])("Different Redis adapters (object) - %s configuration", (_, method, createOptions) => {
    describe.each([['"ioredis" client (object)', IoRedisClient]])("%s", (_, adapter) => {
        let executor: FixedWindowRedisExecutor;
        let module: TestingModule;
        const key = "rate-limiter:fixed-window:redis-adapters:scope";

        beforeEach(async () => {
            module = await Test.createTestingModule({
                imports: [RateLimiterModule[method](createOptions(adapter))]
            }).compile();

            executor = module.get(FixedWindowRedisExecutor);

            await module.init();
        });

        afterEach(async () => {
            await module.close();
        });

        it("should allow request", async () => {
            const options: FixedWindowOptions = {
                limit: 10,
                ttl: MS_IN_MINUTE
            };

            const check = await executor.check(key, options);

            expect(check).toBeTrue();
        });
    });
});
