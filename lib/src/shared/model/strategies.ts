/**
 * Algorithms.
 *
 * @publicApi
 */
export type Strategies = "fixed-window" | "token-bucket" | "sliding-window-counter" | "sliding-window-log" | "leaky-bucket";

export type BaseStrategyState = {
    expiresAt: number;
};
