import type { InjectionToken } from "@nestjs/common";
import type { InstanceWrapper } from "@nestjs/core/internal";
import type { ApiResponseOptions } from "@nestjs/swagger";
import type { IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import type { IOptionsFactory } from "../custom/options-factories";
import type { RateLimitOptions } from "../decorators";
import type { BypassStrategies, Scope, StrategyRequiredOptionsUnion } from "../shared/model";

/**
 * Structural Nest application type.
 *
 * `INestApplication` from different `@nestjs/common` majors (11 vs 12) is not
 * assignable because of unique-symbol fields, even though runtime `get()` is compatible.
 */
export type NestApplicationLike = {
    // biome-ignore lint/suspicious/noExplicitAny: must stay compatible across Nest 11 and 12
    get<T = any>(token: any, options?: any): T;
};

export type FilteredRoute = {
    controller: InstanceWrapper;
    methods: string[];
};

export type RateLimiterSwaggerConfig = {
    /**
     * A custom transformer function for fine-tuning the OpenAPI specification.
     *
     * Allows you to completely overwrite or dynamically extend the `ApiResponseOptions` object
     * based on the resolved rate limit options of a specific endpoint.
     *
     * @param options The final rate limit options applied to the current endpoint (including inheritance).
     * @returns A Swagger response options object compatible with the OpenAPI specification.
     */
    transform?: (options: RateLimitOptions) => ApiResponseOptions;

    /**
     * A list of exclusions to prevent automatic documentation.
     *
     * You can pass strings in two formats:
     * 1. Controller class name — disables 429 error documentation for the entire controller.
     * 2. `Controller.Method` format — disables documentation for a specific endpoint.
     *
     * @example
     * ```typescript
     * excludeRoutes: ['HealthController', 'CatsController.findAll']
     * ```
     */
    excludeRoutes?: string[];

    /**
     * Strict (explicit) documentation strategy for rate limits.
     *
     * - `true`: The 429 error will appear in the Swagger UI **only** for methods or controllers
     *   where the `@RateLimit()` decorator is explicitly attached. Global default options
     *   defined during module initialization will be ignored for undocumented routes.
     * - `false`: The entire project will be documented automatically. Endpoints without
     *   the decorator will display global default rate limits.
     *
     * @default false
     */
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
