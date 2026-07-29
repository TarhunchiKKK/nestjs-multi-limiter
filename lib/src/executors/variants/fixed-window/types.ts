import type { BaseStrategyState } from "../../../shared/model";

/**
 * @publicApi
 */
export type FixedWindowOptions = {
    /**
     * Maximum requests count.
     */
    limit: number;

    /**
     * Requests limit time-to-live in milliseconds.
     */
    ttl: number;
};

export type FixedWindowState = BaseStrategyState & {
    /**
     * Current allowed requests count.
     */
    count: number;

    /**
     * Last reset timestamp.
     */
    resetTime: number;
};
