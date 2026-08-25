/** biome-ignore-all lint/suspicious/noExplicitAny: `any` type is necessary for real type providing */
import type { InjectionToken, ModuleMetadata, Type } from "@nestjs/common";
import type { IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import type { IOptionsFactory } from "../custom/options-factories";
import type { StrategyOptionsMap } from "../executors";
import type { Scope, Strategies } from "../shared/model";
import type { StorageOptions } from "./common-options.types";

/**
 * Sync options for `RateLimiterModule` configuration.
 *
 * @publicApi
 */
export type RateLimiterModuleOptions = {
    /**
     * Default scope.
     */
    scope?: Scope;

    /**
     * Storage options.
     */
    storage: StorageOptions;

    /**
     * Default rate limiting algorithm.
     */
    strategy?: Strategies;

    /**
     * Default options for different algorithms.
     */
    strategyOptions?: {
        fixedWindow?: Partial<StrategyOptionsMap["fixed-window"]>;
        tokenBucket?: Partial<StrategyOptionsMap["token-bucket"]>;
        slidingWindowCounter?: Partial<StrategyOptionsMap["sliding-window-counter"]>;
        slidingWindowLog?: Partial<StrategyOptionsMap["sliding-window-log"]>;
        leakyBucket?: Partial<StrategyOptionsMap["leaky-bucket"]>;
    };

    /**
     * Providers that are used by default.
     */
    defaultProviders?: {
        keyExtractor?: InjectionToken<IKeyExtractor>;
        errorFactory?: InjectionToken<IErrorFactory>;
        optionsFactory?: InjectionToken<IOptionsFactory>;
    };
};

export interface IRateLimiterModuleOptionsFactory {
    createRateLimiterModuleOptions(): RateLimiterModuleOptions | Promise<RateLimiterModuleOptions>;
}

/**
 * Async options for `RateLimiterModule` configuration.
 *
 * @publicApi
 */
export type RateLimiterModuleAsyncOptions = Pick<ModuleMetadata, "imports"> & {
    inject?: any[];

    useClass?: Type<IRateLimiterModuleOptionsFactory>;

    useExisting?: Type<IRateLimiterModuleOptionsFactory>;

    useFactory?: (...args: any[]) => RateLimiterModuleOptions | Promise<RateLimiterModuleOptions>;
};

export type RateLimiterModuleFullOptions = {
    scope: Scope;

    storage: Required<StorageOptions>;

    strategy: Strategies;
    strategyOptions: {
        fixedWindow: StrategyOptionsMap["fixed-window"];
        tokenBucket: StrategyOptionsMap["token-bucket"];
        slidingWindowCounter: StrategyOptionsMap["sliding-window-counter"];
        slidingWindowLog: StrategyOptionsMap["sliding-window-log"];
        leakyBucket: StrategyOptionsMap["leaky-bucket"];
    };

    defaultProviders: {
        keyExtractor: InjectionToken<IKeyExtractor>;
        errorFactory: InjectionToken<IErrorFactory>;
        optionsFactory?: InjectionToken<IOptionsFactory>;
    };
};
