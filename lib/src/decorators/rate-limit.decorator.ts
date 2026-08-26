import { type InjectionToken, SetMetadata } from "@nestjs/common";
import type { StrategyOptions } from "../config";
import type { IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import type { IOptionsFactory } from "../custom/options-factories";
import type { DeepPartial, OmitFields, PartialUnionMembers } from "../shared/lib";
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
} & PartialUnionMembers<StrategyPartialOptionsUnion>;

export type RateLimitNormalizedOptions = Pick<RateLimitOptions, "scope" | "bypass" | "keyExtractor" | "errorFactory" | "factory"> &
    DeepPartial<StrategyOptions>;

export function normalizeOptions(options: RateLimitOptions): RateLimitNormalizedOptions {
    const result: RateLimitNormalizedOptions = {};

    const { bypass, scope, keyExtractor, errorFactory, factory, strategy, ...strategyOptions } = options;

    if ("bypass" in options) {
        result.bypass = bypass;
    }

    if ("scope" in options) {
        result.scope = scope;
    }

    if ("keyExtractor" in options) {
        result.keyExtractor = keyExtractor;
    }

    if ("errorFactory" in options) {
        result.errorFactory = errorFactory;
    }

    if ("factory" in options) {
        result.factory = factory;
    }

    if (strategy && "strategy" in options) {
        result.strategy = strategy;
        result.strategyOptions = { [strategy]: strategyOptions };
    }

    return result;
}

/**
 * Decorator that overrides default rate limiting options for handler/controller.
 *
 * @publicApi
 */
export function RateLimit(options: OmitFields<RateLimitOptions, "bypass">) {
    const normalizedOptions = normalizeOptions({ ...options, bypass: undefined });

    return SetMetadata<typeof RATE_LIMIT_METADATA, RateLimitNormalizedOptions>(RATE_LIMIT_METADATA, normalizedOptions);
}
