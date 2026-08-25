import * as fs from "node:fs";
import * as path from "node:path";
import { Inject } from "@nestjs/common";
import type { RateLimiterModuleFullOptions } from "../../../config";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../../../di";
import type { IRedisAdapter, Key } from "../../../shared/model";
import { AbstractRedisExecutor, Executor } from "../../lib";
import type { TokenBucketOptions } from "./types";

@Executor({ strategy: "token-bucket", storage: "redis" })
export class TokenBucketRedisExecutor extends AbstractRedisExecutor<TokenBucketOptions> {
    private readonly luaScript: string;

    public constructor(
        @InjectStorage() private readonly redis: IRedisAdapter,
        @Inject(MODULE_OPTIONS_TOKEN) readonly moduleOptions: RateLimiterModuleFullOptions
    ) {
        super(moduleOptions);

        const luaScriptPath = path.join(__dirname, "../../../../lua/token-bucket.lua");

        this.luaScript = fs.readFileSync(luaScriptPath, "utf-8");
    }

    protected async performScript(key: Key, options: TokenBucketOptions) {
        const keysCount = 1;
        const startTime = Date.now();

        return await this.redis.eval(
            this.luaScript,
            keysCount,
            key,
            startTime.toString(),
            options.capacity.toString(),
            options.refillRate.toString(),
            options.ttl.toString()
        );
    }
}
