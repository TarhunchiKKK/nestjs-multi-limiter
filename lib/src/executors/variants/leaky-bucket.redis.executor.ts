import * as fs from "node:fs";
import * as path from "node:path";
import { Inject } from "@nestjs/common";
import type { RateLimiterModuleFullOptions } from "../../config";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../../di";
import type { IRedisAdapter, Key, LeakyBucketOptions } from "../../shared/model";
import { AbstractRedisExecutor, Executor } from "../lib";

@Executor({ strategy: "leaky-bucket", storage: "redis" })
export class LeakyBucketRedisExecutor extends AbstractRedisExecutor<LeakyBucketOptions> {
    private readonly luaScript: string;

    public constructor(
        @InjectStorage() private readonly redis: IRedisAdapter,
        @Inject(MODULE_OPTIONS_TOKEN) protected readonly moduleOptions: RateLimiterModuleFullOptions
    ) {
        super(moduleOptions);

        const luaScriptPath = path.join(__dirname, "../../../../lua/leaky-bucket.lua");

        this.luaScript = fs.readFileSync(luaScriptPath, "utf-8");
    }

    protected async performScript(key: Key, options: LeakyBucketOptions) {
        const keysCount = 1;

        const startTime = Date.now();

        return await this.redis.eval(
            this.luaScript,
            keysCount,
            key,
            startTime.toString(),
            options.capacity.toString(),
            options.leakRate.toString(),
            options.ttl.toString()
        );
    }
}
