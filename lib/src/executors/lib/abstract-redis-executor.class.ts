import type { RateLimiterModuleFullOptions } from "../../config/options";
import { UnknownRedisFailingStrategyError } from "../../shared/errors";
import type { Key } from "../../shared/model";
import type { IExecutor } from "./executor.interface";

export abstract class AbstractRedisExecutor<Options> implements IExecutor<Options> {
    public constructor(protected readonly moduleOptions: RateLimiterModuleFullOptions) {}

    public async check(key: Key, options: Options) {
        try {
            return this.performScript(key, options);
        } catch (error: unknown) {
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

    public abstract performScript(key: Key, options: Options): boolean | Promise<boolean>;
}
