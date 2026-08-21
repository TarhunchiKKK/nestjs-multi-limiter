import { Injectable, Module } from "@nestjs/common";
import type { IRateLimiterModuleOptionsFactory, RateLimiterModuleOptions } from "../../../src/config/options";

export const RATE_LIMITER_MODULE_SYNC_REDIS_OPTIONS: RateLimiterModuleOptions = {
    storage: {
        type: "redis",
        adapter: {
            eval: () => Promise.resolve(1)
        }
    }
};

@Injectable()
export class RateLimiterConfigService implements IRateLimiterModuleOptionsFactory {
    public createRateLimiterModuleOptions(): RateLimiterModuleOptions | Promise<RateLimiterModuleOptions> {
        return RATE_LIMITER_MODULE_SYNC_REDIS_OPTIONS;
    }
}

@Module({
    providers: [RateLimiterConfigService],
    exports: [RateLimiterConfigService]
})
export class RateLimiterConfigModule {}
