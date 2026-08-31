import type { InjectionToken } from "@nestjs/common";
import type { ApiResponseOptions } from "@nestjs/swagger";
import type { IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import type { IOptionsFactory } from "../custom/options-factories";
import type { RateLimitOptions } from "../decorators";
import type { BypassStrategies, Scope, StrategyRequiredOptionsUnion } from "../shared/model";

export type RateLimiterSwaggerConfig = {
    transform?: (options: RateLimitOptions) => ApiResponseOptions;

    excludeRoutes?: string[];

    explicitOnly?: boolean;
};

export type RateLimitSwaggerOptions = {
    /**
     * Overrides default scope.
     */
    scope: Scope;

    /**
     * Overrides default key extractor.
     */
    keyExtractor: InjectionToken<IKeyExtractor>;

    /**
     * Overrides default error factory.
     */
    errorFactory: InjectionToken<IErrorFactory>;

    /**
     * Overrides default options factory.
     */
    factory?: InjectionToken<IOptionsFactory>;

    /**
     * This allows to bypass rate limiting (skip or reject).
     */
    bypass?: BypassStrategies;
} & StrategyRequiredOptionsUnion;
