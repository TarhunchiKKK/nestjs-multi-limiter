import * as fs from "node:fs";
import * as path from "node:path";
import { Inject } from "@nestjs/common";
import type { RateLimiterModuleFullOptions } from "../../config";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../../di";
import { generateSalt } from "../../shared/lib";
import type { IRedisAdapter, Key, SlidingWindowLogOptions } from "../../shared/model";
import { AbstractRedisExecutor, Executor } from "../lib";

@Executor({ strategy: "sliding-window-log", storage: "redis" })
export class SlidingWindowLogRedisExecutor extends AbstractRedisExecutor<SlidingWindowLogOptions> {
    private readonly luaScript: string;

    public constructor(
        @InjectStorage() private readonly redis: IRedisAdapter,
        @Inject(MODULE_OPTIONS_TOKEN) readonly moduleOptions: RateLimiterModuleFullOptions
    ) {
        super(moduleOptions);

        const luaScriptPath = path.join(__dirname, "../../../lua/sliding-window-log.lua");

        this.luaScript = fs.readFileSync(luaScriptPath, "utf-8");
    }

    protected async performScript(key: Key, options: SlidingWindowLogOptions) {
        const startTime = Date.now();
        const salt = generateSalt();
        const keysCount = 1;

        return await this.redis.eval(this.luaScript, keysCount, key, startTime.toString(), options.windowMs.toString(), options.limit.toString(), salt);
    }
}
