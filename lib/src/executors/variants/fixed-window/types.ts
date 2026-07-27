/**
 * @publicApi
 */
export type FixedWindowOptions = {
    /**
     * Maximum requests count.
     */
    limit: number;

    /**
     * Requests limit time-to-live.
     */
    ttl: number;
};

export type FixedWindowState = {
    /**
     * Current allowed requests count.
     */
    count: number;

    /**
     * Last attemptions reset time.
     */
    resetTime: number;
};
