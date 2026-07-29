import type { ExecutionContext } from "@nestjs/common";
import type { RateLimitOptions } from "../../config/options";

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
    getOptions: (context: ExecutionContext) => RateLimitOptions | Promise<RateLimitOptions>;
}
