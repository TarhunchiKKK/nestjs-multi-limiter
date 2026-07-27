/**
 * @publicApi
 */
export type TokenBucketOptions = {
    /**
     * Maximum tokens count.
     */
    capacity: number;

    /**
     * The number of tokens that are added in 1 millisecond.
     */
    refillRate: number;

    /**
     * Tokens time-to-live (for Redis only).
     */
    ttl: number;
};

export type TokenBucketState = {
    /**
     * Current tokens count.
     */
    tokens: number;

    /**
     * Timestamp of last tokens refilling.
     */
    lastRefilled: number;
};
