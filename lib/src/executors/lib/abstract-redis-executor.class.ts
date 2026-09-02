import type { RateLimiterModuleFullOptions } from "../../config";
import { RedisAdapterError, UnknownRedisFailingStrategyError } from "../../shared/errors";
import { castLuaScriptResult, type Key } from "../../shared/model";
import type { IExecutor } from "./executor.interface";

export abstract class AbstractRedisExecutor<Options> implements IExecutor<Options> {
    public constructor(protected readonly moduleOptions: RateLimiterModuleFullOptions) {}

    public async check(key: Key, options: Options) {
        try {
            const result = await this.performScript(key, options);

            return castLuaScriptResult(result);
        } catch (error: unknown) {
            if (error instanceof RedisAdapterError) {
                return this.applyFailingStrategy(error);
            }

            if (this.moduleOptions.storage.type === "redis") {
                await this.moduleOptions.storage.adapter.handleError?.(error, key);
            }

            throw error;
        }
    }

    protected abstract performScript(key: Key, options: Options): unknown | Promise<unknown>;

    private applyFailingStrategy(error: RedisAdapterError) {
        if (this.moduleOptions.storage.type !== "redis") {
            throw error;
        }

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
}
