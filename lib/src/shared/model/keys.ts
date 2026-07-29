import { DEFAULT_SCOPE } from "./scopes";

/**
 * Type for rate limiting data saving key.
 *
 * @publicApi
 */
export type Key = string;

export function getKey(key: unknown, strategy: string, scope = DEFAULT_SCOPE) {
    return `rate-limiter:${strategy}:${key}:${scope}`;
}
