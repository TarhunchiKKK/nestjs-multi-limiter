import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { ErrorFactory, type IErrorFactory, type IKeyExtractor, type IOptionsFactory, KeyExtractor, OptionsFactory, RateLimiterModule } from "../../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../../src/config/defaults/default-options.constants";
import { ProvidersDiscoveryService } from "../../../../src/services/providers-discovery.service";

@KeyExtractor()
class CustomKeyExtractor implements IKeyExtractor {
    public extract() {
        return "key";
    }
}

@ErrorFactory()
class CustomErrorFactory implements IErrorFactory {
    public getError() {
        return new Error();
    }
}

@OptionsFactory()
class CustomOptionsFactory implements IOptionsFactory {
    public getOptions() {
        return {};
    }
}

describe("ProvidersDiscoveryService - custom providers discovery", () => {
    let service: ProvidersDiscoveryService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                RateLimiterModule.forRoot({
                    ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS,
                    defaultProviders: {
                        keyExtractor: CustomKeyExtractor,
                        // CustomErrorFactory not listed as default provider
                        optionsFactory: CustomOptionsFactory
                    }
                })
            ],
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
