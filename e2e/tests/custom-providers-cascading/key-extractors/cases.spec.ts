import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { ControllerLevelController, ModuleLevelController } from "./controllers";
import { ControllerLevelKeyExtractor, ModuleLevelKeyExtractor } from "./providers";

const LIMIT = 1;

const options: RateLimiterModuleAsyncOptions = {
    useFactory: () => ({
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
    })
};

describe("Custom key extractors cascading", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RateLimiterModule.forRootAsync(options)],
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
        await request(app.getHttpServer()).get("/module/test").set("module-id", "1").expect(HttpStatus.OK);
        await request(app.getHttpServer()).get("/module/test").set("module-id", "1").expect(HttpStatus.TOO_MANY_REQUESTS);

        await request(app.getHttpServer()).get("/module/test").set("module-id", "2").expect(HttpStatus.OK);
    });

    it("should use module key extractor and isolate limits by controller-id (controller level)", async () => {
        await request(app.getHttpServer()).get("/controller/test").set("controller-id", "1").set("module-id", "1").expect(HttpStatus.OK);

        await request(app.getHttpServer()).get("/controller/test").set("controller-id", "1").set("module-id", "2").expect(HttpStatus.TOO_MANY_REQUESTS);

        await request(app.getHttpServer()).get("/controller/test").set("controller-id", "2").set("module-id", "1").expect(HttpStatus.OK);
    });
});
