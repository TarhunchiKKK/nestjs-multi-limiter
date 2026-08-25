import { describe, expect, it } from "bun:test";
import { DEFAULT_MODULE_OPTIONS, type RateLimiterModuleFullOptions, type StorageOptions, validateModuleOptions } from "../../../src/config";
import { RateLimiterModuleConfigurationError } from "../../../src/shared/errors";

function createValidOptions(): RateLimiterModuleFullOptions {
    return {
        ...DEFAULT_MODULE_OPTIONS,
        storage: { ...DEFAULT_MODULE_OPTIONS.storage },
        strategyOptions: {
            fixedWindow: { ...DEFAULT_MODULE_OPTIONS.strategyOptions.fixedWindow },
            tokenBucket: { ...DEFAULT_MODULE_OPTIONS.strategyOptions.tokenBucket },
            slidingWindowCounter: { ...DEFAULT_MODULE_OPTIONS.strategyOptions.slidingWindowCounter },
            slidingWindowLog: { ...DEFAULT_MODULE_OPTIONS.strategyOptions.slidingWindowLog },
            leakyBucket: { ...DEFAULT_MODULE_OPTIONS.strategyOptions.leakyBucket }
        },
        defaultProviders: { ...DEFAULT_MODULE_OPTIONS.defaultProviders }
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
                },
                failingStrategy: "fail-open"
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
                adapter: undefined as never,
                failingStrategy: "fail-first"
            } as unknown as Required<StorageOptions>;

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
