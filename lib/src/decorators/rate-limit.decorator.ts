import { type InjectionToken, SetMetadata } from "@nestjs/common";
import type { StrategyOptions } from "../config";
import type { IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import type { IOptionsFactory } from "../custom/options-factories";
import type { DeepPartial, OmitFields } from "../shared/lib";
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

export const temp: RateLimitOptions = {};

export type RateLimitNormalizedOptions = Pick<RateLimitOptions, "scope" | "bypass" | "keyExtractor" | "errorFactory" | "factory"> &
    DeepPartial<StrategyOptions>;

export function normalizeOptions(rateLimitOptions: RateLimitOptions): RateLimitNormalizedOptions {
    if ("options" in rateLimitOptions) {
        const { options, ...rest } = rateLimitOptions;

        return {
            ...rest,
            strategyOptions: rateLimitOptions.strategy ? { [rateLimitOptions.strategy]: options } : {}
        };
    }

    return rateLimitOptions;
}

/**
 * Decorator that overrides default rate limiting options for handler/controller.
 *
 * @publicApi
 */
export function RateLimit(options: OmitFields<RateLimitOptions, "bypass">) {
    const normalizedOptions = normalizeOptions({ ...options, bypass: "none" });

    return SetMetadata<typeof RATE_LIMIT_METADATA, RateLimitNormalizedOptions>(RATE_LIMIT_METADATA, normalizedOptions);
}
