/** biome-ignore-all lint/suspicious/noExplicitAny: `any` type is necessary for real type providing */
import type { ModuleMetadata, Type } from "@nestjs/common";
import type { IErrorFactory } from "../../custom/error-factories";
import type { IKeyExtractor } from "../../custom/key-extractors";
import type { IOptionsFactory } from "../../custom/options-factories";
import type { AllStrategiesOptions } from "../../executors";
import type { TokenType } from "../../shared/lib";
import type { Scope, Strategies } from "../../shared/model";
import type { StorageOptions } from "./common.options";

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
        fixedWindow?: Partial<AllStrategiesOptions["fixed-window"]>;
        tokenBucket?: Partial<AllStrategiesOptions["token-bucket"]>;
        slidingWindowCounter?: Partial<AllStrategiesOptions["sliding-window-counter"]>;
        slidingWindowLog?: Partial<AllStrategiesOptions["sliding-window-log"]>;
        leakyBucket?: Partial<AllStrategiesOptions["leaky-bucket"]>;
    };

    /**
     * Providers that are used by default.
     */
    defaultProviders?: {
        // FIX: should `TokenType` be here?
        // `ProvidersDiscoveryService` looks for metadata added by corresponding decorators.
        // No-classes cannot have such metadata
        keyExtractor?: Type<IKeyExtractor> | TokenType;
        errorFactory?: Type<IErrorFactory> | TokenType;
        optionsFactory?: Type<IOptionsFactory> | TokenType;
    };
};

/**
 * Async options for `RateLimiterModule` configuration.
 *
 * @publicApi
 */
export type RateLimiterModuleAsyncOptions = Pick<ModuleMetadata, "imports"> & {
    /**
     * Dependencies to inject.
     */
    inject?: any[];

    /**
     * Function that creates dynamic module options.
     *
     * @param args Injected dependencies.
     * @returns Dynamic options.
     */
    useFactory: (...args: any[]) => RateLimiterModuleOptions | Promise<RateLimiterModuleOptions>;
};

export type RateLimiterModuleFullOptions = {
    scope: Scope;

    storage: Required<StorageOptions>;

    strategy: Strategies;
    strategyOptions: {
        fixedWindow: AllStrategiesOptions["fixed-window"];
        tokenBucket: AllStrategiesOptions["token-bucket"];
        slidingWindowCounter: AllStrategiesOptions["sliding-window-counter"];
        slidingWindowLog: AllStrategiesOptions["sliding-window-log"];
        leakyBucket: AllStrategiesOptions["leaky-bucket"];
    };

    defaultProviders: {
        keyExtractor: Type<IKeyExtractor> | TokenType;
        errorFactory: Type<IErrorFactory> | TokenType;
        optionsFactory?: Type<IOptionsFactory> | TokenType;
    };
};
