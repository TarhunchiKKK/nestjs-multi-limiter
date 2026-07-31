import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleOptions } from "../../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../../src/config/defaults/default-options.constants";
import { ProvidersDiscoveryService } from "../../../../src/services/providers-discovery.service";
import { CustomErrorFactory, CustomKeyExtractor, CustomOptionsFactory } from "../../../shared";

const optionsWihDefaultProviders = {
    ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS,
    defaultProviders: {
        keyExtractor: CustomKeyExtractor,
        // CustomErrorFactory not listed as default provider
        optionsFactory: CustomOptionsFactory
    }
} satisfies RateLimiterModuleOptions;

describe.each([
    ["sync", "forRoot", optionsWihDefaultProviders],
    ["async", "forRootAsync", { useFactory: () => optionsWihDefaultProviders }]
])("ProvidersDiscoveryService - custom providers discovery (%s configuration)", (_, method, options) => {
    let service: ProvidersDiscoveryService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [RateLimiterModule[method](options)],
            providers: [CustomKeyExtractor, CustomErrorFactory, CustomOptionsFactory]
        }).compile();

        service = module.get(ProvidersDiscoveryService);

        await module.init();
    });

    afterEach(async () => {
        await module.close();
    });

    it("should find custom key extractor", () => {
        const keyExtractor = service.getKeyExtractor(CustomKeyExtractor);

        expect(keyExtractor).toBeDefined();
        expect(keyExtractor.extract).toBeFunction();
    });

    it("should find custom error factory", () => {
        const errorFactory = service.getErrorFactory(CustomErrorFactory);

        expect(errorFactory).toBeDefined();
        expect(errorFactory.getError).toBeFunction();
    });

    it("should find custom options factory", () => {
        const optionsFactory = service.getOptionsFactory(CustomOptionsFactory);

        expect(optionsFactory).toBeDefined();
        expect(optionsFactory.getOptions).toBeFunction();
    });
});
