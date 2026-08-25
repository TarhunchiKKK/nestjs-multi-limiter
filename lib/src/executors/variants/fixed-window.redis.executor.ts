import * as fs from "node:fs";
import * as path from "node:path";
import { Inject } from "@nestjs/common";
import type { RateLimiterModuleFullOptions } from "../../config";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../../di";
import type { FixedWindowOptions, IRedisAdapter, Key } from "../../shared/model";
import { AbstractRedisExecutor, Executor } from "../lib";

@Executor({ strategy: "fixed-window", storage: "redis" })
export class FixedWindowRedisExecutor extends AbstractRedisExecutor<FixedWindowOptions> {
    private readonly luaScript: string;

    public constructor(
        @InjectStorage() private readonly redis: IRedisAdapter,
        @Inject(MODULE_OPTIONS_TOKEN) protected readonly moduleOptions: RateLimiterModuleFullOptions
    ) {
        super(moduleOptions);

        const luaScriptPath = path.join(__dirname, "../../../../lua/fixed-window.lua");

        this.luaScript = fs.readFileSync(luaScriptPath, "utf-8");
    }

    protected async performScript(key: Key, options: FixedWindowOptions) {
        const keysCount = 1;

        return await this.redis.eval(this.luaScript, keysCount, key, options.limit.toString(), options.ttl.toString());
    }
}
