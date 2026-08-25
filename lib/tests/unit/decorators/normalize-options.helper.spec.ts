import { describe, expect, it } from "bun:test";
import { normalizeOptions, type RateLimitNormalizedOptions, type RateLimitOptions } from "../../../src/decorators";

describe("normalizeOptions", () => {
    it("should build options for different strategies", () => {
        const inputs: RateLimitOptions[] = [
            {
                strategy: "fixed-window",
                ttl: 10,
                limit: 10
            },
            {
                strategy: "token-bucket",
                ttl: 10,
                refillRate: 10,
                capacity: 10
            },
            {
                strategy: "sliding-window-counter",
                limit: 10,
                windowMs: 10
            },
            {
                strategy: "sliding-window-log",
                limit: 10,
                windowMs: 10
            },
            {
                strategy: "leaky-bucket",
                ttl: 10,
                capacity: 10,
                leakRate: 10
            }
        ];

        const outputs = [
            {
                strategy: "fixed-window",
                strategyOptions: {
                    "fixed-window": {
                        ttl: 10,
                        limit: 10
                    }
                }
            },
            {
                strategy: "token-bucket",
                strategyOptions: {
                    "token-bucket": {
                        ttl: 10,
                        refillRate: 10,
                        capacity: 10
                    }
                }
            },
            {
                strategy: "sliding-window-counter",
                strategyOptions: {
                    "sliding-window-counter": {
                        limit: 10,
                        windowMs: 10
                    }
                }
            },
            {
                strategy: "sliding-window-log",
                strategyOptions: {
                    "sliding-window-log": {
                        limit: 10,
                        windowMs: 10
                    }
                }
            },
            {
                strategy: "leaky-bucket",
                strategyOptions: {
                    "leaky-bucket": {
                        ttl: 10,
                        capacity: 10,
                        leakRate: 10
                    }
                }
            }
        ] satisfies RateLimitNormalizedOptions[];

        for (let i = 0; i < inputs.length; i++) {
            const result = normalizeOptions(inputs[i]);

            expect(result).toEqual(outputs[i]);
        }
    });

    it("should return full options object", () => {
        const input: RateLimitOptions = {
            scope: "custom-scope",
            bypass: "skip",
            keyExtractor: "key-extractor-token",
            errorFactory: "error-factory-token",
            factory: "factory-token",
            strategy: "token-bucket",
            ttl: 10,
            refillRate: 10,
            capacity: 10
        };

        const output: RateLimitNormalizedOptions = {
            scope: "custom-scope",
            bypass: "skip",
            keyExtractor: "key-extractor-token",
            errorFactory: "error-factory-token",
            factory: "factory-token",
            strategy: "token-bucket",
            strategyOptions: {
                "token-bucket": {
                    ttl: 10,
                    refillRate: 10,
                    capacity: 10
                }
            }
        };

        const result = normalizeOptions(input);

        expect(result).toEqual(output);
    });

    it("should return empty options", () => {
        const input: RateLimitOptions = {};
        const output: RateLimitNormalizedOptions = {};

        const result = normalizeOptions(input);

        expect(result).toEqual(output);
        expect(Object.keys(result)).toEqual(Object.keys(output));
    });
});
