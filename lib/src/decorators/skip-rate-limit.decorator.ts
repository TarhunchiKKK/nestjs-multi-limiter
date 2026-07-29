import { applyDecorators } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

// QUESTION: Can this decorators be merged into single?
export const SkipRateLimitDecorator = Reflector.createDecorator<true>();

/**
 * Decorator that excludes handler/controller from rate limiting check.
 *
 * @publicApi
 */
export function SkipRateLimit() {
    return applyDecorators(SkipRateLimitDecorator(true));
}
