import type { ExecutionContext } from "@nestjs/common";
import type { AllStrategiesOptions } from "../../executors";
import type { Key, Scope, Strategies } from "../../shared/model";

/**
 * Options for the custom rate limiting error creating.
 *
 * @publicApi
 */
export type ErrorFactoryOptions = {
    /**
     * Key for rate limiting data saving.
     */
    key: Key;

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
    strategyOptions: AllStrategiesOptions[keyof AllStrategiesOptions];
};

/**
 * Interface for custom error factories.
 *
 * @publicApi
 */
export interface IErrorFactory {
    /**
     * @param context Execution context of current request.
     * @param options Error creation options.
     * @returns Created error.
     */
    getError: (context: ExecutionContext, options: ErrorFactoryOptions) => Error | Promise<Error>;
}
