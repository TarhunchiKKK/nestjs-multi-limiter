import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions, type RateLimiterModuleOptions } from "nestjs-rate-limiter";
import request from "supertest";
import { ControllerLevelController, ModuleLevelController } from "./controllers";
import { ControllerLevelKeyExtractor, ModuleLevelKeyExtractor } from "./providers";

const LIMIT = 1;

const syncOptions: RateLimiterModuleOptions = {
    storage: {
        type: "in-memory"
    },
    strategy: "fixed-window",
    strategyOptions: {
        fixedWindow: {
            limit: LIMIT
        }
    },
    defaultProviders: {
        keyExtractor: ModuleLevelKeyExtractor
    }
};

const asyncOptions: RateLimiterModuleAsyncOptions = {
    useFactory: () => syncOptions
};

describe("Custom options factories cascading", () => {
    describe.each([
        ["sync", "forRoot", syncOptions],
        ["async", "forRootAsync", asyncOptions]
    ])("Override default (%s configuration)", (_, method, options) => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule[method](options)],
                controllers: [ModuleLevelController, ControllerLevelController],
                providers: [ModuleLevelKeyExtractor, ControllerLevelKeyExtractor]
            }).compile();

            app = moduleFixture.createNestApplication();

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it("should isolate limits (module level)", async () => {
            await request(app.getHttpServer()).get("/module/override").set("module-id", "1").expect(HttpStatus.OK);
            await request(app.getHttpServer()).get("/module/override").set("module-id", "1").expect(HttpStatus.TOO_MANY_REQUESTS);

            await request(app.getHttpServer()).get("/module/override").set("module-id", "2").expect(HttpStatus.OK);
        });

        it("should override module key extractor and isolate limits by controller-id (controller level)", async () => {
            await request(app.getHttpServer()).get("/controller/override").set("controller-id", "1").set("module-id", "1").expect(HttpStatus.OK);

            await request(app.getHttpServer()).get("/controller/override").set("controller-id", "1").set("module-id", "2").expect(HttpStatus.TOO_MANY_REQUESTS);

            await request(app.getHttpServer()).get("/controller/override").set("controller-id", "2").set("module-id", "1").expect(HttpStatus.OK);
        });
    });
});
