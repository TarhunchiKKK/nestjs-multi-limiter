import { SetMetadata } from "@nestjs/common";
import { RATE_LIMIT_METADATA, type RateLimitOptions } from "./rate-limit.decorator";

/**
 * Decorator that excludes handler/controller from rate limiting check.
 *
 * @publicApi
 */
export function SkipRateLimit() {
    return SetMetadata<typeof RATE_LIMIT_METADATA, RateLimitOptions>(RATE_LIMIT_METADATA, { bypass: "skip" });
}
