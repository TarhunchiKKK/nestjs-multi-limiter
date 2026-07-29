import * as fs from "node:fs";
import * as path from "node:path";
import { InjectStorage } from "../../../di";
import type { Key, RedisAdapter } from "../../../shared/model";
import { Executor, type IExecutor } from "../../lib";
import type { FixedWindowOptions } from "./types";

@Executor({ strategy: "fixed-window", storage: "redis" })
export class FixedWindowRedisExecutor implements IExecutor<FixedWindowOptions> {
    private readonly luaScript: string;

    public constructor(@InjectStorage() private readonly redis: RedisAdapter) {
        const luaScriptPath = path.join(__dirname, "../../../../lua/fixed-window.lua");
        this.luaScript = fs.readFileSync(luaScriptPath, "utf-8");
    }

    public async check(key: Key, options: FixedWindowOptions) {
        const keysCount = 1;

        const currentCount = (await this.redis.eval(this.luaScript, keysCount, key, options.ttl.toString())) as number;

        return currentCount <= options.limit;
    }
}
