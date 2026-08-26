import type { InjectionToken } from "@nestjs/common";
import type { StrategyOptions } from "../../config";
import type { IErrorFactory } from "../../custom/error-factories";
import type { IKeyExtractor } from "../../custom/key-extractors";
import type { IOptionsFactory } from "../../custom/options-factories";
import type { DeepPartial } from "../../shared/lib";
import type { BypassStrategies, Scope, StrategyPartialOptionsUnion } from "../../shared/model";

/**
 * Options for `RateLimit` decorator.
 *
 * @publicApi
 */
export type RateLimitOptions = {
    /**
     * Overrides default scope.
     */
    scope?: Scope;

    /**
     * Overrides default key extractor.
     */
    keyExtractor?: InjectionToken<IKeyExtractor>;

    /**
     * Overrides default error factory.
     */
    errorFactory?: InjectionToken<IErrorFactory>;

    /**
     * Overrides default options factory.
     */
    factory?: InjectionToken<IOptionsFactory>;

    /**
     * This allows to bypass rate limiting (skip or reject).
     */
    bypass?: BypassStrategies;
} & StrategyPartialOptionsUnion;

export type RateLimitNormalizedOptions = Pick<RateLimitOptions, "scope" | "bypass" | "keyExtractor" | "errorFactory" | "factory"> &
    DeepPartial<StrategyOptions>;
