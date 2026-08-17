import { describe, expect, it } from "bun:test";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../src/config/defaults/default-options.constants";
import { RateLimiterModuleConfigurationError, validateModuleOptions } from "../../../src/config/helpers";
import type { RateLimiterModuleFullOptions } from "../../../src/config/options";

function createValidOptions(): RateLimiterModuleFullOptions {
    return {
        ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS,
        storage: { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.storage },
        strategyOptions: {
            fixedWindow: { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.fixedWindow },
            tokenBucket: { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.tokenBucket },
            slidingWindowCounter: { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.slidingWindowCounter },
            slidingWindowLog: { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.slidingWindowLog },
            leakyBucket: { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.leakyBucket }
        },
        defaultProviders: { ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.defaultProviders }
    };
}

describe("validateModuleOptions", () => {
    describe("success", () => {
        it("accepts valid in-memory options", () => {
            expect(() => validateModuleOptions(createValidOptions())).not.toThrow();
        });

        it("accepts valid redis options", () => {
            const options = createValidOptions();

            options.storage = {
                type: "redis",
                adapter: {
                    eval: () => Promise.resolve(1)
                }
            };

            expect(() => validateModuleOptions(options)).not.toThrow();
        });
    });

    describe("scope", () => {
        it("rejects missing scope", () => {
            const options = createValidOptions();

            options.scope = "" as RateLimiterModuleFullOptions["scope"];

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("rejects invalid scope type", () => {
            const options = createValidOptions();

            options.scope = 123 as unknown as RateLimiterModuleFullOptions["scope"];

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });
    });

    describe("storage", () => {
        it("rejects invalid in-memory gcTime", () => {
            const options = createValidOptions();

            options.storage = {
                type: "in-memory",
                gcTime: -1
            };

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("rejects missing redis adapter", () => {
            const options = createValidOptions();

            options.storage = {
                type: "redis",
                adapter: undefined as never
            };

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("rejects unknown storage type", () => {
            const options = createValidOptions();

            options.storage = {
                type: "unknown"
            } as unknown as RateLimiterModuleFullOptions["storage"];

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });
    });

    describe("strategy", () => {
        it("rejects unknown strategy", () => {
            const options = createValidOptions();

            options.strategy = "unknown" as RateLimiterModuleFullOptions["strategy"];

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });
    });

    describe("strategyOptions", () => {
        it("rejects invalid fixed-window options", () => {
            const options = createValidOptions();

            options.strategyOptions.fixedWindow = {
                limit: -1,
                ttl: "invalid" as unknown as number
            };

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("rejects invalid token-bucket options", () => {
            const options = createValidOptions();

            options.strategyOptions.tokenBucket = {
                capacity: -1,
                refillRate: -1,
                ttl: -1
            };

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("rejects invalid sliding-window-counter options", () => {
            const options = createValidOptions();

            options.strategyOptions.slidingWindowCounter = {
                limit: -1,
                windowMs: -1
            };

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("rejects invalid sliding-window-log options", () => {
            const options = createValidOptions();

            options.strategyOptions.slidingWindowLog = {
                limit: -1,
                windowMs: -1
            };

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("rejects invalid leaky-bucket options", () => {
            const options = createValidOptions();

            options.strategyOptions.leakyBucket = {
                capacity: -1,
                leakRate: -1,
                ttl: -1
            };

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });

        it("collects errors from multiple validators", () => {
            const options = createValidOptions();

            options.scope = "" as RateLimiterModuleFullOptions["scope"];
            options.strategy = "unknown" as RateLimiterModuleFullOptions["strategy"];
            options.strategyOptions.fixedWindow.limit = -1;

            expect(() => validateModuleOptions(options)).toThrow(RateLimiterModuleConfigurationError);
        });
    });
});
