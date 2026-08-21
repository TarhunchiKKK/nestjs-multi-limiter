import * as fs from "node:fs";
import * as path from "node:path";
import { Inject } from "@nestjs/common";
import type { RateLimiterModuleFullOptions } from "../../../config/options";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../../../di";
import { castLuaScriptResult, type IRedisAdapter, type Key } from "../../../shared/model";
import { AbstractRedisExecutor, Executor } from "../../lib";
import type { SlidingWindowCounterOptions } from "./types";

@Executor({ strategy: "sliding-window-counter", storage: "redis" })
export class SlidingWindowCounterRedisExecutor extends AbstractRedisExecutor<SlidingWindowCounterOptions> {
    private readonly luaScript: string;

    public constructor(
        @InjectStorage() private readonly redis: IRedisAdapter,
        @Inject(MODULE_OPTIONS_TOKEN) readonly moduleOptions: RateLimiterModuleFullOptions
    ) {
        super(moduleOptions);

        const luaScriptPath = path.join(__dirname, "../../../../lua/sliding-window-counter.lua");

        this.luaScript = fs.readFileSync(luaScriptPath, "utf-8");
    }

    protected async performScript(key: Key, options: SlidingWindowCounterOptions) {
        const keysCount = 1;
        const startTime = Date.now();

        const result = await this.redis.eval(this.luaScript, keysCount, key, startTime.toString(), options.windowMs.toString(), options.limit.toString());

        return castLuaScriptResult(result);
    }
}
