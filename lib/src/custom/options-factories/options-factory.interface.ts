import type { ExecutionContext } from "@nestjs/common";
import type { RateLimitOptions } from "../../decorators";
import type { OmitFields } from "../../shared/lib";

export type DynamicRateLimitOptions = OmitFields<RateLimitOptions, "factory">;

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
