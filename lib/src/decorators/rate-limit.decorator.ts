import { Reflector } from "@nestjs/core";
import type { RateLimitOptions } from "../config/options";

/**
 * Decorator that overrides default rate limiting options for handler/controller.
 *
 * @publicApi
 */
export const RateLimit = Reflector.createDecorator<RateLimitOptions>();
