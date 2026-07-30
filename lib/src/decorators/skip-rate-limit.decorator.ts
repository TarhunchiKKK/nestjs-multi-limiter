import { Reflector } from "@nestjs/core";

/**
 * Decorator that excludes handler/controller from rate limiting check.
 *
 * @publicApi
 */
export const SkipRateLimit = Reflector.createDecorator<boolean, true>({
    transform: () => true
});
