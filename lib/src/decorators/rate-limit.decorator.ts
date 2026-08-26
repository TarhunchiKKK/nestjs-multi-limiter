import { type InjectionToken, SetMetadata } from "@nestjs/common";
import type { IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import type { IOptionsFactory } from "../custom/options-factories";
import type { OmitFields } from "../shared/lib";
import type { BypassStrategies, Scope, StrategyPartialOptionsUnion } from "../shared/model";

export const RATE_LIMIT_METADATA = "_rate_limit_metadata";

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

/**
 * Decorator that overrides default rate limiting options for handler/controller.
 *
 * @publicApi
 */
export function RateLimit(options: OmitFields<RateLimitOptions, "bypass">) {
    return SetMetadata<typeof RATE_LIMIT_METADATA, RateLimitOptions>(RATE_LIMIT_METADATA, { ...options, bypass: "none" });
}
