import type { ExecutionContext } from "@nestjs/common";
import type { Key, Scope, Strategies, StrategyOptionsMap } from "../../shared/model";

/**
 * Options for the custom rate limiting error creating.
 *
 * @publicApi
 */
export type ErrorFactoryOptions = {
    /**
     * Key for rate limiting data saving. Key can be not defined, for example when request was forcibly rejected.
     */
    key?: Key;

    /**
     * Rate limiting scope.
     */
    scope: Scope;

    /**
     * Selected rate limiting algorithm.
     */
    strategy: Strategies;

    /**
     * Configuration for selected rate limiting algorithm.
     */
    strategyOptions: StrategyOptionsMap;

    /**
     * Was this field forcibly rejected.
     */
    forceReject: boolean;
};

/**
 * Interface for custom error factories.
 *
 * @publicApi
 */
export interface IErrorFactory<TError = Error> {
    /**
     * @warning This method should not throw error. It should only create it.
     *
     * @param context Execution context of current request.
     * @param options Error creation options.
     * @returns Created error.
     */
    getError: (context: ExecutionContext, options: ErrorFactoryOptions) => TError | Promise<TError>;
}
