import { beforeEach, describe } from "bun:test";
import { afterEach } from "node:test";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { RateLimitGuard } from "../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../src/config/defaults/default-options.constants";
import type { RateLimitGuardOptions } from "../../../src/config/options";
import { GUARD_OPTIONS_TOKEN } from "../../../src/di";
import { ProvidersDiscoveryService } from "../../../src/services/providers-discovery.service";
import { clearMock, createProvidersDiscoveryServiceMock, createReflectorMock } from "../../shared";

const guardOptions: RateLimitGuardOptions = {
    ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS,
    ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS.defaultProviders,
    strategyOptions: {
        "fixed-window": RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.fixedWindow,
        "token-bucket": RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.tokenBucket,
        "sliding-window-counter": RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.slidingWindowCounter,
        "sliding-window-log": RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.slidingWindowLog,
        "leaky-bucket": RATE_LIMITER_MODULE_DEFAULT_OPTIONS.strategyOptions.leakyBucket
    }
};

describe("RateLimitGuard", () => {
    let guard: RateLimitGuard;
    const reflectorMock = createReflectorMock();
    const discoveryServiceMock = createProvidersDiscoveryServiceMock();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                RateLimitGuard,
                {
                    provide: GUARD_OPTIONS_TOKEN,
                    useValue: guardOptions
                },
                {
                    provide: Reflector,
                    useValue: reflectorMock
                },
                {
                    provide: ProvidersDiscoveryService,
                    useValue: discoveryServiceMock
                }
            ]
        }).compile();

        guard = module.get(RateLimitGuard);
    });

    afterEach(() => {
        clearMock(reflectorMock);
        clearMock(discoveryServiceMock);
    });
});
