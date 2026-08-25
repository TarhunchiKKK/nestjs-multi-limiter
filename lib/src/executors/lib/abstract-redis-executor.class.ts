import type { RateLimiterModuleFullOptions } from "../../config";
import { UnknownRedisFailingStrategyError } from "../../shared/errors";
import { castLuaScriptResult, type Key } from "../../shared/model";
import type { IExecutor } from "./executor.interface";

export abstract class AbstractRedisExecutor<Options> implements IExecutor<Options> {
    public constructor(protected readonly moduleOptions: RateLimiterModuleFullOptions) {}

    public async check(key: Key, options: Options) {
        let result: unknown = null;

        try {
            result = await this.performScript(key, options);
        } catch (error: unknown) {
            if (this.moduleOptions.storage.type !== "redis") {
                throw error;
            }

            await this.moduleOptions.storage.adapter.onError?.(error);

            switch (this.moduleOptions.storage.failingStrategy) {
                case "fail-open":
                    return true;
                case "fail-close":
                    return false;
                case "fail-fast":
                    throw error;
                default:
                    throw new UnknownRedisFailingStrategyError(this.moduleOptions.storage.failingStrategy);
            }
        }

        return castLuaScriptResult(result);
    }

    protected abstract performScript(key: Key, options: Options): unknown | Promise<unknown>;
}
