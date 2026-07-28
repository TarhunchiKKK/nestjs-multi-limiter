import type { BaseStrategyState } from "../../../shared/model";

/**
 * @publicApi
 */
export type SlidingWindowCounterOptions = {
    /**
     * Maximum requests count per window.
     */
    limit: number;

    /**
     * Window length in milliseconds.
     * Example: 60000 for 1 minute.
     */
    windowMs: number;
};

export type SlidingWindowCounterState = BaseStrategyState & {
    /**
     * Current window start timestamp.
     */
    currentWindowStart: number;

    /**
     * Current window equests counter.
     */
    currentCount: number;

    /**
     * Previous window requests counter.
     */
    previousCount: number;
};
