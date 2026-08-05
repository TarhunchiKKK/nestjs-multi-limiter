import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis, type RedisValue } from "ioredis";
import type { RedisAdapter } from "nestjs-rate-limiter";

@Injectable()
export class RedisService implements RedisAdapter, OnModuleDestroy {
    private client: Redis;

    public constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.getOrThrow<string>("REDIS_HOST"),
            port: +this.configService.getOrThrow<number>("REDIS_PORT")
        });
    }

    public async eval(script: string | Buffer<ArrayBufferLike>, numKeys: string | number, ...args: RedisValue[]) {
        return await this.client.eval(script, numKeys, ...args);
    }

    public async flush() {
        await this.client.flushdb();
    }

    public async onModuleDestroy() {
        await this.client.quit();
    }
}
