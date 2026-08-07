import { Injectable, Module, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { RedisValue } from "ioredis";
import { createClient } from "redis";
import type { IRedisAdapter } from "../../../src";
import { createRedisClient } from "../helpers/redis.helpers";

export const IoRedisClient = createRedisClient();

@Injectable()
export class IoRedisAdapter implements IRedisAdapter {
    private client = createRedisClient();

    public async eval(script: string | Buffer<ArrayBufferLike>, numKeys: string | number, ...args: RedisValue[]) {
        return await this.client.eval(script, numKeys, ...args);
    }
}

@Injectable()
export class NodeRedisAdapter implements IRedisAdapter, OnModuleInit, OnModuleDestroy {
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

@Module({
    providers: [IoRedisAdapter, NodeRedisAdapter],
    exports: [IoRedisAdapter, NodeRedisAdapter]
})
export class RedisModule {}

export const IO_REDIS_ADAPTER_TOKEN = "IO_REDIS_ADAPTER";

export const NODE_REDIS_ADAPTER_TOKEN = "NODE_REDIS_ADAPTER";

@Module({
    providers: [
        {
            provide: IO_REDIS_ADAPTER_TOKEN,
            useClass: IoRedisAdapter
        },
        {
            provide: NODE_REDIS_ADAPTER_TOKEN,
            useClass: NodeRedisAdapter
        }
    ],
    exports: [IO_REDIS_ADAPTER_TOKEN, NODE_REDIS_ADAPTER_TOKEN]
})
export class TokenBasedRedisModule {}
