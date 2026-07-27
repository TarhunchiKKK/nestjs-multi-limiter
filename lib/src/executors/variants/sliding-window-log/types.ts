/**
 * @publicApi
 */
export type SlidingWindowLogOptions = {
    /**
     * Maximum requests count per window.
     */
    limit: number;

    /**
     * Window length in milliseconds.
     */
    windowMs: number;
};

export type SlidingWindowLogState = number[];
