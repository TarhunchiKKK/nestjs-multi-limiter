import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { type RedisValue } from "ioredis";
import type { IRedisAdapter } from "nestjs-multi-limiter";

@Injectable()
export class RedisService implements IRedisAdapter, OnModuleDestroy {
    private readonly client: Redis;

    public constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.getOrThrow("REDIS_HOST"),
            port: +this.configService.getOrThrow("REDIS_PORT")
        });
    }

    public async eval(script: string | Buffer<ArrayBufferLike>, numKeys: string | number, ...args: RedisValue[]) {
        return await this.client.eval(script, numKeys, ...args);
    }

    public async onModuleDestroy() {
        await this.client.quit();
    }
}
