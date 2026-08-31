import type { ExecutionContext, InjectionToken } from "@nestjs/common";
import type { BypassStrategies, Scope, StrategyPartialOptionsUnion } from "../../shared/model";
import type { IErrorFactory } from "../error-factories";
import type { IKeyExtractor } from "../key-extractors";

export type DynamicRateLimitOptions = {
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
     * This allows to bypass rate limiting (skip or reject).
     */
    bypass?: BypassStrategies;
} & StrategyPartialOptionsUnion;

/**
 * Interface for custom dynamic options factories.
 *
 * @publicApi
 */
export interface IOptionsFactory {
    /**
     * @param context Execution context of current request.
     * @returns Created dynamic options object.
     */
    getOptions: (context: ExecutionContext) => DynamicRateLimitOptions | Promise<DynamicRateLimitOptions>;
}
