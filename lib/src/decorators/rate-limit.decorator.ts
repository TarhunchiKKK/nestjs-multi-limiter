import type { InjectionToken } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { StrategyOptions } from "../config";
import type { IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import type { IOptionsFactory } from "../custom/options-factories";
import type { DeepPartial, PartialUnionMembers } from "../shared/lib";
import type { BypassStrategies, Scope, StrategyOptionsUnion } from "../shared/model";

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
} & PartialUnionMembers<StrategyOptionsUnion>;

export type RateLimitNormalizedOptions = Pick<RateLimitOptions, "scope" | "bypass" | "keyExtractor" | "errorFactory" | "factory"> &
    DeepPartial<StrategyOptions>;

export function normalizeOptions(options: RateLimitOptions): RateLimitNormalizedOptions {
    const { bypass, scope, keyExtractor, errorFactory, factory, strategy, ...strategyOptions } = options;

    return {
        bypass: bypass,
        scope: scope,
        keyExtractor,
        errorFactory,
        factory,
        strategy,
        strategyOptions: strategy ? { [strategy]: strategyOptions } : undefined
    };
}

/**
 * Decorator that overrides default rate limiting options for handler/controller.
 *
 * @publicApi
 */
export const RateLimit = Reflector.createDecorator<RateLimitOptions>();
