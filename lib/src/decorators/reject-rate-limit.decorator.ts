import { applyDecorators } from "@nestjs/common";
import { RateLimit } from "./rate-limit.decorator";

/**
 * Decorator tah forcibly rejects rate limiting for handler/controller.
 *
 * @publicApi
 */
export function RejectRateLimit() {
    return applyDecorators(RateLimit({ bypass: "reject" }));
}
