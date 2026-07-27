import { beforeAll, describe, expect, it } from "bun:test";
import { ModulesContainer, Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { RateLimiterModule } from "../../../../src";
import { RATE_LIMITER_MODULE_DEFAULT_OPTIONS } from "../../../../src/config/defaults/default-options.constants";
import { BuiltinErrorFactory } from "../../../../src/custom/error-factories";
import { BuiltinKeyExtractor } from "../../../../src/custom/key-extractors";
import { ProvidersDiscoveryService } from "../../../../src/services/providers-discovery.service";

describe("ProvidersDiscoveryService - built-in providers discovery", () => {
    let service: ProvidersDiscoveryService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [RateLimiterModule.forRoot(RATE_LIMITER_MODULE_DEFAULT_OPTIONS)],

            // DELETE: are this providers necessary?
            providers: [ModulesContainer, Reflector]
        }).compile();

        service = module.get(ProvidersDiscoveryService);
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
