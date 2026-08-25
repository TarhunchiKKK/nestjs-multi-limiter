import { describe, expect, it } from "bun:test";
import type { RateLimiterModuleOptions } from "../../../src";
import { DEFAULT_MODULE_OPTIONS } from "../../../src/config/default-options.constants";
import { mergeDefaultOptions } from "../../../src/config/defaults";
import { DEFAULT_SCOPE } from "../../../src/shared/model";

describe("mergeDefaultOptions", () => {
    describe("scope", () => {
        it("default", () => {
            const input = {
                storage: {
                    type: "in-memory"
                }
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            expect(result.scope).toBe(DEFAULT_SCOPE);
        });

        it("custom", () => {
            const input = {
                storage: {
                    type: "in-memory"
                },
                scope: "custom-scope"
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            expect(result.scope).toBe(input.scope);
        });
    });

    describe("storage", () => {
        it("in-memory storage", () => {
            const input = {
                storage: {
                    type: "in-memory"
                }
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            expect(result.storage.type).toBe(input.storage.type);
        });

        it("redis storage", () => {
            const input = {
                storage: {
                    type: "redis",
                    adapter: {
                        eval: () => Promise.resolve(1)
                    },
                    failingStrategy: "fail-open"
                }
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            expect(result.storage).toEqual(input.storage);
        });
    });

    describe("strategy", () => {
        it("default", () => {
            const input = {
                storage: {
                    type: "in-memory"
                }
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            expect(result.strategy).toBe(DEFAULT_MODULE_OPTIONS.strategy);
        });

        it("custom", () => {
            const input = {
                storage: {
                    type: "in-memory"
                },
                strategy: "sliding-window-log"
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            expect(result.strategy).toBe(input.strategy);
        });

        it("strategy options", () => {
            const input = {
                storage: {
                    type: "in-memory"
                },
                strategyOptions: {
                    fixedWindow: {
                        // full strategy options
                        ttl: 10,
                        limit: 10
                    },
                    tokenBucket: {
                        // partial options
                        ttl: 10
                    },
                    slidingWindowCounter: {
                        // empty options
                    }
                    // no options for remaining strategies
                }
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            // expectations for full options object
            expect(result.strategyOptions.fixedWindow).toEqual(input.strategyOptions.fixedWindow);

            // expectations for partial options object
            expect(result.strategyOptions.tokenBucket.ttl).toBe(input.strategyOptions.tokenBucket.ttl);
            expect(result.strategyOptions.tokenBucket.refillRate).toBe(DEFAULT_MODULE_OPTIONS.strategyOptions.tokenBucket.refillRate);
            expect(result.strategyOptions.tokenBucket.capacity).toBe(DEFAULT_MODULE_OPTIONS.strategyOptions.tokenBucket.capacity);

            // expectations for empty options objects
            expect(result.strategyOptions.slidingWindowCounter).toEqual(DEFAULT_MODULE_OPTIONS.strategyOptions.slidingWindowCounter);
            expect(result.strategyOptions.slidingWindowLog).toEqual(DEFAULT_MODULE_OPTIONS.strategyOptions.slidingWindowLog);
            expect(result.strategyOptions.leakyBucket).toEqual(DEFAULT_MODULE_OPTIONS.strategyOptions.leakyBucket);
        });
    });

    describe("providers", () => {
        it("default", () => {
            const input = {
                storage: {
                    type: "in-memory"
                }
            } satisfies RateLimiterModuleOptions;

            const result = mergeDefaultOptions(input);

            expect(result.defaultProviders.keyExtractor).toBeDefined();
            expect(result.defaultProviders.errorFactory).toBeDefined();
            expect(result.defaultProviders.optionsFactory).toBeUndefined();
        });
    });
});
