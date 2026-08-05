import * as fs from "node:fs";
import * as path from "node:path";
import { InjectStorage } from "../../../di";
import { generateSalt } from "../../../shared/lib";
import type { IRedisAdapter, Key } from "../../../shared/model";
import { Executor, type IExecutor } from "../../lib";
import type { SlidingWindowLogOptions } from "./types";

@Executor({ strategy: "sliding-window-log", storage: "redis" })
export class SlidingWindowLogRedisExecutor implements IExecutor<SlidingWindowLogOptions> {
    private readonly luaScript: string;

    public constructor(@InjectStorage() private readonly redis: IRedisAdapter) {
        const luaScriptPath = path.join(__dirname, "../../../../lua/sliding-window-log.lua");
        this.luaScript = fs.readFileSync(luaScriptPath, "utf-8");
    }

    public async check(key: Key, options: SlidingWindowLogOptions) {
        const startTime = Date.now();
        const salt = generateSalt();
        const keysCount = 1;

        const result = await this.redis.eval(this.luaScript, keysCount, key, startTime.toString(), options.windowMs.toString(), options.limit.toString(), salt);

        return result === 1;
    }
}
