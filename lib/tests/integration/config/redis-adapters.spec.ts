import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { RedisValue } from "ioredis";
import { createClient } from "redis";
import { type IRedisAdapter, RateLimiterModule } from "../../../src";
import { type FixedWindowOptions, FixedWindowRedisExecutor } from "../../../src/executors";
import { createRedisClient, MS_IN_MINUTE } from "../../shared";

const IoRedisClient = createRedisClient();

@Injectable()
class IoRedisAdapter implements IRedisAdapter {
    private client = createRedisClient();

    public async eval(script: string | Buffer<ArrayBufferLike>, numKeys: string | number, ...args: RedisValue[]) {
        return await this.client.eval(script, numKeys, ...args);
    }
}

@Injectable()
class NodeRedisAdapter implements IRedisAdapter, OnModuleInit, OnModuleDestroy {
    private client: ReturnType<typeof createClient>;

    public constructor() {
        this.client = createClient({
            url: "redis://localhost:6379"
        });

        this.client.on("error", (err) => console.error("Redis Client Error", err));
    }

    public async onModuleInit() {
        await this.client.connect();
    }

    public async onModuleDestroy() {
        await this.client.quit();
    }

    public async eval(...args: [script: string | Buffer, numKeys: number | string, ...args: RedisValue[]]) {
        const [script, numKeys, ...rest] = args;

        const keysCount = typeof numKeys === "string" ? parseInt(numKeys, 10) : numKeys;

        const keys = rest.slice(0, keysCount).map(String);
        const argv = rest.slice(keysCount).map(String);

        return await this.client.eval(script.toString(), {
            keys: keys,
            arguments: argv
        });
    }
}

describe("Different redis adapters", () => {
    describe.each([
        ['"ioredis" client', IoRedisClient, []],
        ['"ioredis" adapter', IoRedisAdapter, [IoRedisAdapter]],
        ['"node-redis" adapter', NodeRedisAdapter, [NodeRedisAdapter]]
    ])("%s", (_, adapter, providers) => {
        let executor: FixedWindowRedisExecutor;
        let module: TestingModule;
        const key = "rate-limiter:fixed-window:redis-adapters:scope";

        beforeEach(async () => {
            module = await Test.createTestingModule({
                imports: [
                    RateLimiterModule.forRoot({
                        storage: {
                            type: "redis",
                            // QUESTION: This test should fail
                            adapter: adapter
                        }
                    })
                ],
                providers: providers
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
