import type { ExtractMember } from "../lib/utility-types";

/**
 * Algorithms.
 *
 * @publicApi
 */
export type Strategies = "fixed-window" | "token-bucket" | "sliding-window-counter" | "sliding-window-log" | "leaky-bucket";

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

export type StrategyOptionsMap = {
    "fixed-window": FixedWindowOptions;
    "token-bucket": TokenBucketOptions;
    "sliding-window-counter": SlidingWindowCounterOptions;
    "sliding-window-log": SlidingWindowLogOptions;
    "leaky-bucket": LeakyBucketOptions;
};

export type StrategyPartialOptionsUnion =
    | ({ strategy: ExtractMember<Strategies, "fixed-window"> } & { options?: Partial<FixedWindowOptions> })
    | ({ strategy: ExtractMember<Strategies, "token-bucket"> } & { options?: Partial<TokenBucketOptions> })
    | ({ strategy: ExtractMember<Strategies, "sliding-window-counter"> } & { options?: Partial<SlidingWindowCounterOptions> })
    | ({ strategy: ExtractMember<Strategies, "sliding-window-log"> } & { options?: Partial<SlidingWindowLogOptions> })
    | ({ strategy: ExtractMember<Strategies, "leaky-bucket"> } & { options?: Partial<LeakyBucketOptions> })
    | { strategy?: Strategies; options?: object };

export type StrategyRequiredOptionsUnion =
    | ({ strategy: ExtractMember<Strategies, "fixed-window"> } & { options: FixedWindowOptions })
    | ({ strategy: ExtractMember<Strategies, "token-bucket"> } & { options: TokenBucketOptions })
    | ({ strategy: ExtractMember<Strategies, "sliding-window-counter"> } & { options: SlidingWindowCounterOptions })
    | ({ strategy: ExtractMember<Strategies, "sliding-window-log"> } & { options: SlidingWindowLogOptions })
    | ({ strategy: ExtractMember<Strategies, "leaky-bucket"> } & { options: LeakyBucketOptions });
