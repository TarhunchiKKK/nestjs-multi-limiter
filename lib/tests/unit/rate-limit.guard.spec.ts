import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { DEFAULT_MODULE_OPTIONS } from "../../src/config/default-options.constants";
import { BuiltinKeyExtractor } from "../../src/custom/key-extractors";
import type { RateLimitOptions } from "../../src/decorators";
import { GUARD_OPTIONS_TOKEN } from "../../src/di";
import { RateLimitGuard, type RateLimitGuardOptions } from "../../src/rate-limit.guard";
import { RateLimiterModule } from "../../src/rate-limiter.module";
import { ProvidersResolver } from "../../src/services/providers.resolver";
import {
    CustomError,
    CustomErrorFactory,
    CustomKeyExtractor,
    CustomOptionsFactory,
    clearMock,
    createProvidersDiscoveryServiceMock,
    createReflectorMock,
    EXECUTION_CONTEXT
} from "../shared";

describe("RateLimitGuard", () => {
    let guard: RateLimitGuard;
    let guardOptions: RateLimitGuardOptions;
    const reflectorMock = createReflectorMock();
    const discoveryServiceMock = createProvidersDiscoveryServiceMock();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [RateLimiterModule.forRoot(DEFAULT_MODULE_OPTIONS)],
            providers: [CustomKeyExtractor, CustomErrorFactory, CustomOptionsFactory]
        })
            .overrideProvider(Reflector)
            .useValue(reflectorMock)
            .overrideProvider(ProvidersResolver)
            .useValue(discoveryServiceMock)
            .compile();

        guard = module.get(RateLimitGuard);
        guardOptions = module.get(GUARD_OPTIONS_TOKEN);
    });

    afterEach(() => {
        clearMock(reflectorMock);
        clearMock(discoveryServiceMock);
    });

    describe("bypassing", () => {
        it("should skip rate limiting (route level)", async () => {
            reflectorMock.get.mockReturnValue({ bypass: "skip" });

            const result = await guard.canActivate(EXECUTION_CONTEXT);

            expect(result).toBeTrue();
        });

        it("should skip rate limiting (class level)", async () => {
            reflectorMock.get.mockReturnValueOnce(undefined).mockReturnValueOnce({ bypass: "skip" });

            const result = await guard.canActivate(EXECUTION_CONTEXT);

            expect(result).toBeTrue();
        });

        it("should reject rate limiting (route level)", async () => {
            reflectorMock.get
                .mockReturnValueOnce({ bypass: "reject", errorFactory: CustomErrorFactory } satisfies RateLimitOptions)
                .mockReturnValueOnce(undefined);

            discoveryServiceMock.getKeyExtractor.mockResolvedValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockResolvedValue(new CustomErrorFactory());

            const resultPromise = guard.canActivate(EXECUTION_CONTEXT);

            expect(resultPromise).rejects.toThrow(CustomError);
        });

        it("should reject rate limiting (class level)", async () => {
            reflectorMock.get
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce({ bypass: "reject", errorFactory: CustomErrorFactory } satisfies RateLimitOptions);

            discoveryServiceMock.getKeyExtractor.mockResolvedValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockResolvedValue(new CustomErrorFactory());

            const resultPromise = guard.canActivate(EXECUTION_CONTEXT);

            expect(resultPromise).rejects.toThrow(CustomError);
        });
    });

    describe.each([
        ["route-level", true],
        ["class-level", false]
    ])("providers (%s metadata)", (_, useRouteLevelMetadata) => {
        it("should use default providers", async () => {
            reflectorMock.get.mockReturnValue(undefined);

            discoveryServiceMock.getExecutor.mockReturnValue({ check: () => true });
            discoveryServiceMock.getKeyExtractor.mockResolvedValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockResolvedValue(new CustomErrorFactory());
            discoveryServiceMock.getOptionsFactory.mockResolvedValue(new CustomOptionsFactory());

            const result = await guard.canActivate(EXECUTION_CONTEXT);

            expect(result).toBeTrue();
            expect(discoveryServiceMock.getKeyExtractor).toHaveBeenCalledWith(guardOptions.keyExtractor);
            expect(discoveryServiceMock.getErrorFactory).toHaveBeenCalledWith(guardOptions.errorFactory);
        });

        it("should override default providers", async () => {
            if (useRouteLevelMetadata) {
                reflectorMock.get.mockReturnValueOnce(undefined);
            }

            reflectorMock.get.mockReturnValueOnce({
                keyExtractor: CustomKeyExtractor,
                errorFactory: CustomErrorFactory,
                factory: CustomOptionsFactory
            } satisfies RateLimitOptions);

            discoveryServiceMock.getExecutor.mockReturnValue({ check: () => true });
            discoveryServiceMock.getKeyExtractor.mockResolvedValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockResolvedValue(new CustomErrorFactory());
            discoveryServiceMock.getOptionsFactory.mockResolvedValue({ getOptions: () => ({ scope: "custom-scope" }) });

            const result = await guard.canActivate(EXECUTION_CONTEXT);

            expect(result).toBeTrue();
            expect(discoveryServiceMock.getKeyExtractor).toHaveBeenCalledWith(CustomKeyExtractor);
            expect(discoveryServiceMock.getErrorFactory).toHaveBeenCalledWith(CustomErrorFactory);
            expect(discoveryServiceMock.getOptionsFactory).toHaveBeenCalledWith(CustomOptionsFactory);
        });
    });

    describe.each([
        ["route-level", true],
        ["class-level", false]
    ])("custom providers (%s metadata)", (_, useRouteLevelMetadata) => {
        it("should throw custom error", async () => {
            if (useRouteLevelMetadata) {
                reflectorMock.get.mockReturnValueOnce(undefined);
            }

            reflectorMock.get.mockReturnValueOnce({
                errorFactory: CustomErrorFactory
            } satisfies RateLimitOptions);

            discoveryServiceMock.getExecutor.mockReturnValue({ check: () => false });
            discoveryServiceMock.getKeyExtractor.mockResolvedValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockResolvedValue(new CustomErrorFactory());

            const resultPromise = guard.canActivate(EXECUTION_CONTEXT);

            expect(resultPromise).rejects.toThrow(CustomError);
        });

        it("should not override static options", async () => {
            if (useRouteLevelMetadata) {
                reflectorMock.get.mockReturnValueOnce(undefined);
            }

            reflectorMock.get.mockReturnValueOnce({
                keyExtractor: CustomKeyExtractor,
                factory: CustomOptionsFactory
            } satisfies RateLimitOptions);

            discoveryServiceMock.getExecutor.mockReturnValue({ check: () => true });
            discoveryServiceMock.getKeyExtractor.mockResolvedValue(new CustomKeyExtractor());
            discoveryServiceMock.getErrorFactory.mockResolvedValue(new CustomErrorFactory());
            discoveryServiceMock.getOptionsFactory.mockResolvedValue({ getOptions: () => ({ keyExtractor: BuiltinKeyExtractor }) });

            const result = await guard.canActivate(EXECUTION_CONTEXT);

            expect(result).toBeTrue();
            expect(discoveryServiceMock.getKeyExtractor).toHaveBeenCalledWith(CustomKeyExtractor);
        });
    });
});
