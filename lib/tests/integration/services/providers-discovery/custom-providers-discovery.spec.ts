import { beforeAll, describe, expect, it } from "bun:test";
import { ModulesContainer, Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
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

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                RateLimiterModule.forRoot({
                    ...RATE_LIMITER_MODULE_DEFAULT_OPTIONS,
                    defaultProviders: {
                        keyExtractor: CustomKeyExtractor,
                        // CustomErrorFactoryis not listed as default provider
                        optionsFactory: CustomOptionsFactory
                    }
                })
            ],

            // DELETE: are first 2 providers necessary?
            providers: [ModulesContainer, Reflector, CustomKeyExtractor, CustomErrorFactory, CustomOptionsFactory]
        }).compile();

        service = module.get(ProvidersDiscoveryService);
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
