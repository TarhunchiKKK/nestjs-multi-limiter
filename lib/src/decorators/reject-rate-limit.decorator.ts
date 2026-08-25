import { SetMetadata } from "@nestjs/common";
import { RATE_LIMIT_METADATA, type RateLimitNormalizedOptions } from "./rate-limit.decorator";

/**
 * Decorator tah forcibly rejects rate limiting for handler/controller.
 *
 * @publicApi
 */
export function RejectRateLimit() {
    return SetMetadata<typeof RATE_LIMIT_METADATA, RateLimitNormalizedOptions>(RATE_LIMIT_METADATA, { bypass: "reject" });
}
