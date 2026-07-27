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
     * Redis key time-to-live in milliseconds.
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
