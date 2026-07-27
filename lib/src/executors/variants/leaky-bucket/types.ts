/**
 * @publicApi
 */
export type LeakyBucketOptions = {
    /**
     * Maximum bucket size.
     */
    capacity: number;

    /**
     * Outflow rate: How many requests go in in 1 millisecond.
     */
    leakRate: number;

    /**
     * Redis key time-to-live in milliseconds.
     */
    ttl: number;
};

export type LeakyBucketState = {
    /**
     * Current "water" level (requests count in queue).
     */
    water: number;

    /**
     * Timestamp of the last overflow recalculation.
     */
    lastLeaked: number;
};
