import { applyDecorators } from "@nestjs/common";
import { RateLimit } from "./rate-limit.decorator";

/**
 * Decorator that excludes handler/controller from rate limiting check.
 *
 * @publicApi
 */
export function SkipRateLimit() {
    return applyDecorators(RateLimit({ bypass: "skip" }));
}
