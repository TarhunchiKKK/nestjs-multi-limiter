import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, RateLimitGuard } from "../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../src/config/defaults/default-options.constants";
import type { RateLimitGuardOptions, RateLimitOptions } from "../../../src/config/options";
import { GUARD_OPTIONS_TOKEN } from "../../../src/di";
import { ProvidersDiscoveryService } from "../../../src/services/providers-discovery.service";
import {
    CustomErrorFactory,
    CustomKeyExtractor,
    CustomOptionsFactory,
    clearMock,
    createProvidersDiscoveryServiceMock,
    createReflectorMock
} from "../../shared";

const context = {
    getHandler: () => ({})
};

describe("RateLimitGuard", () => {
    let guard: RateLimitGuard;
    let guardOptions: RateLimitGuardOptions;
    const reflectorMock = createReflectorMock();
    const discoveryServiceMock = createProvidersDiscoveryServiceMock();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [RateLimiterModule.forRoot(RATE_LIMITER_MODULE_DEFAULT_OPTIONS)],
            providers: [CustomKeyExtractor, CustomErrorFactory, CustomOptionsFactory]
        })
            .overrideProvider(Reflector)
            .useValue(reflectorMock)
            .overrideProvider(ProvidersDiscoveryService)
            .useValue(discoveryServiceMock)
            .compile();

        guard = module.get(RateLimitGuard);
        guardOptions = module.get(GUARD_OPTIONS_TOKEN);
    });

    afterEach(() => {
        clearMock(reflectorMock);
        clearMock(discoveryServiceMock);
    });

    describe("skipping", () => {
        it("should skip rate limiting", async () => {
            reflectorMock.get.mockReturnValue(true);

            const result = await guard.canActivate(context as unknown as ExecutionContext);

            expect(result).toBeTrue();
        });
    });

    describe("providers", () => {
        it("should use default providers", async () => {
            reflectorMock.get.mockReturnValueOnce(false).mockReturnValueOnce(undefined);

            discoveryServiceMock.getExecutor.mockReturnValue({ check: () => true });
            discoveryServiceMock.getKeyExtractor.mockReturnValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockReturnValue(new CustomErrorFactory());
            discoveryServiceMock.getOptionsFactory.mockReturnValue(new CustomOptionsFactory());

            const result = await guard.canActivate(context as unknown as ExecutionContext);

            expect(result).toBeTrue();
            expect(discoveryServiceMock.getKeyExtractor).toHaveBeenCalledWith(guardOptions.keyExtractor);
            expect(discoveryServiceMock.getErrorFactory).toHaveBeenCalledWith(guardOptions.errorFactory);
        });

        it("should override default providers", async () => {
            reflectorMock.get.mockReturnValueOnce(false).mockReturnValueOnce({
                keyExtractor: CustomKeyExtractor,
                errorFactory: CustomErrorFactory,
                factory: CustomOptionsFactory
            } satisfies RateLimitOptions);

            discoveryServiceMock.getExecutor.mockReturnValue({ check: () => true });
            discoveryServiceMock.getKeyExtractor.mockReturnValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockReturnValue(new CustomErrorFactory());
            discoveryServiceMock.getOptionsFactory.mockReturnValue({ getOptions: () => ({ scope: "custom-scope" }) });

            const result = await guard.canActivate(context as unknown as ExecutionContext);

            expect(result).toBeTrue();
            expect(discoveryServiceMock.getKeyExtractor).toHaveBeenCalledWith(CustomKeyExtractor);
            expect(discoveryServiceMock.getErrorFactory).toHaveBeenCalledWith(CustomErrorFactory);
            expect(discoveryServiceMock.getOptionsFactory).toHaveBeenCalledWith(CustomOptionsFactory);
        });
    });
});
