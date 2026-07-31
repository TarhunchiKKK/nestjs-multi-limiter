import { describe, expect } from "bun:test";
import { beforeEach, it } from "node:test";
import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { RedisValue } from "ioredis";
import { createClient } from "redis";
import { RateLimiterModule, type RedisAdapter } from "../../../src";
import { type FixedWindowOptions, FixedWindowRedisExecutor } from "../../../src/executors";
import { createRedisClient, MS_IN_MINUTE } from "../../shared";

const IoRedisClient = createRedisClient();

@Injectable()
class IoRedisAdapter implements RedisAdapter {
    private client = createRedisClient();

    public eval(script: string | Buffer<ArrayBufferLike>, numkeys: string | number, ...args: RedisValue[]) {
        return this.client.eval(script, numkeys, ...args);
    }
}

@Injectable()
class NodeRedisAdapter implements RedisAdapter, OnModuleInit, OnModuleDestroy {
    private client: ReturnType<typeof createClient>;

    constructor() {
        this.client = createClient();

        this.client.on("error", (err) => console.error("Redis Client Error", err));
    }

    async onModuleInit() {
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.disconnect();
    }

    async eval(...args: [script: string | Buffer, numkeys: number | string, ...args: RedisValue[]]) {
        const [script, numkeys, ...rest] = args;

        const keysCount = typeof numkeys === "string" ? parseInt(numkeys, 10) : numkeys;

        const keys = rest.slice(0, keysCount).map(String);
        const argv = rest.slice(keysCount).map(String);

        return this.client.eval(script.toString(), {
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
        const key = "rate-limiter:fixed-window:redis-adapters:scope";

        beforeEach(async () => {
            const module = await Test.createTestingModule({
                imports: [
                    RateLimiterModule.forRoot({
                        storage: {
                            type: "redis",
                            adapter: adapter
                        }
                    })
                ],
                providers: providers
            }).compile();

            executor = module.get(FixedWindowRedisExecutor);
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
