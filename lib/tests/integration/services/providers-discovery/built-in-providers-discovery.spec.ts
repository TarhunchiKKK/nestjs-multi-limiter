import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule } from "../../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../../src/config/defaults/default-options.constants";
import { BuiltinErrorFactory } from "../../../../src/custom/error-factories";
import { BuiltinKeyExtractor } from "../../../../src/custom/key-extractors";
import { ProvidersDiscoveryService } from "../../../../src/services/providers-discovery.service";

describe("ProvidersDiscoveryService - built-in providers discovery", () => {
    let service: ProvidersDiscoveryService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [RateLimiterModule.forRoot(RATE_LIMITER_MODULE_DEFAULT_OPTIONS)]
        }).compile();

        service = module.get(ProvidersDiscoveryService);

        await module.init();
    });

    afterEach(async () => {
        await module.close();
    });

    it("should find built-in key extractor", () => {
        const keyExtractor = service.getKeyExtractor(BuiltinKeyExtractor);

        expect(keyExtractor).toBeDefined();
        expect(keyExtractor.extract).toBeFunction();
    });

    it("should find built-in error factory", () => {
        const errorFactory = service.getErrorFactory(BuiltinErrorFactory);

        expect(errorFactory).toBeDefined();
        expect(errorFactory.getError).toBeFunction();
    });
});
