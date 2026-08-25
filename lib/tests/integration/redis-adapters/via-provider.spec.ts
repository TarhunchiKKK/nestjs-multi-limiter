import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule } from "../../../src";
import { FixedWindowRedisExecutor } from "../../../src/executors";
import type { FixedWindowOptions } from "../../../src/shared/model";
import { IoRedisAdapter, MS_IN_MINUTE, RedisModule } from "../../shared";

describe("Different Redis adapters (Provider)", () => {
    describe.each([
        ['"ioredis" adapter (class)', [IoRedisAdapter]]
        // FIX: This case throws "error:Socket already opened" error
        // ['"redis" adapter (class)', [NodeRedisAdapter]]
    ])("%s", (_, inject) => {
        let executor: FixedWindowRedisExecutor;
        let module: TestingModule;
        const key = "rate-limiter:fixed-window:redis-adapters:scope";

        beforeEach(async () => {
            module = await Test.createTestingModule({
                imports: [
                    RedisModule,
                    RateLimiterModule.forRootAsync({
                        imports: [RedisModule],
                        inject: inject,
                        useFactory: (...inject) => ({
                            storage: {
                                type: "redis",
                                adapter: inject[0]
                            }
                        })
                    })
                ]
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
