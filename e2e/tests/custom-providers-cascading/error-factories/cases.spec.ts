import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleOptions } from "nestjs-rate-limiter";
import request from "supertest";
import { ControllerLevelController, ModuleLevelController, RouteLevelController } from "./controllers";
import { ControllerLevelErrorFactory, ModuleLevelErrorFactory, RouteLevelErrorFactory } from "./providers";

const LIMIT = 3;

const createSyncOptions = (setDefault: boolean) =>
    ({
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
            errorFactory: setDefault ? ModuleLevelErrorFactory : undefined
        }
    }) satisfies RateLimiterModuleOptions;

const createAsyncOptions = (setDefault: boolean) => ({
    useFactory: () => createSyncOptions(setDefault)
});

describe("Custom error factories cascading", () => {
    describe.each([
        ["sync", "forRoot", createSyncOptions(false)],
        ["async", "forRootAsync", createAsyncOptions(false)]
    ])("Override default (%s configuration)", (_, method, options) => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule[method](options)],
                controllers: [ModuleLevelController, ControllerLevelController, RouteLevelController],
                providers: [ControllerLevelErrorFactory, RouteLevelErrorFactory]
            }).compile();

            app = moduleFixture.createNestApplication();

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it("should use built-in error factory", async () => {
            for (let i = 0; i < LIMIT; i++) {
                await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.OK);
            }

            const response = await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.TOO_MANY_REQUESTS);

            expect(response.body.message).toBe("Too many requests.");
            expect(response.body.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
        });

        it("should use controller-level error factory", async () => {
            for (let i = 0; i < LIMIT; i++) {
                await request(app.getHttpServer()).get("/controller/test").expect(HttpStatus.OK);
            }

            const response = await request(app.getHttpServer()).get("/controller/test").expect(HttpStatus.TOO_MANY_REQUESTS);
            expect(response.body.level).toBe("controller");
        });

        it("should use route-level error factory", async () => {
            for (let i = 0; i < LIMIT; i++) {
                await request(app.getHttpServer()).get("/route/test").expect(HttpStatus.OK);
            }

            const response = await request(app.getHttpServer()).get("/route/test").expect(HttpStatus.TOO_MANY_REQUESTS);
            expect(response.body.level).toBe("route");
        });
    });

    describe.each([
        ["sync", "forRoot", createSyncOptions(true)],
        ["async", "forRootAsync", createAsyncOptions(true)]
    ])("Set as default (%s configuration)", (_, method, options) => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule[method](options)],
                controllers: [ModuleLevelController],
                providers: [ModuleLevelErrorFactory]
            }).compile();

            app = moduleFixture.createNestApplication();

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it("should use module-level error factory", async () => {
            for (let i = 0; i < LIMIT; i++) {
                await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.OK);
            }

            const response = await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.TOO_MANY_REQUESTS);
            expect(response.body.level).toBe("module");
        });
    });
});
