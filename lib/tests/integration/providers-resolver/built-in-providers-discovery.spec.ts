import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { RateLimiterModule } from "../../../src";
import { DEFAULT_MODULE_OPTIONS } from "../../../src/config/default-options.constants";
import { BuiltinErrorFactory } from "../../../src/custom/error-factories";
import { BuiltinKeyExtractor } from "../../../src/custom/key-extractors";
import { ProvidersResolver } from "../../../src/services/providers.resolver";

describe.each([
    ["sync", "forRoot", DEFAULT_MODULE_OPTIONS],
    ["async", "forRootAsync", { useFactory: () => DEFAULT_MODULE_OPTIONS }]
])("ProvidersResolver - built-in providers discovery (%s configuration)", (_, method, options) => {
    let resolver: ProvidersResolver;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [RateLimiterModule[method](options)]
        }).compile();

        resolver = module.get(ProvidersResolver);

        await module.init();
    });

    afterEach(async () => {
        await module.close();
    });

    it("should find built-in key extractor", async () => {
        const keyExtractor = await resolver.getKeyExtractor(BuiltinKeyExtractor);

        expect(keyExtractor).toBeDefined();
        expect(keyExtractor.extract).toBeFunction();
    });

    it("should find built-in error factory", async () => {
        const errorFactory = await resolver.getErrorFactory(BuiltinErrorFactory);

        expect(errorFactory).toBeDefined();
        expect(errorFactory.getError).toBeFunction();
    });
});
