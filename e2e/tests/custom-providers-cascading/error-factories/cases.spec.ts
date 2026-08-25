import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { ControllerLevelController, ModuleLevelController, RouteLevelController } from "./controllers";
import { ControllerLevelErrorFactory, ModuleLevelErrorFactory, RouteLevelErrorFactory } from "./providers";

const LIMIT = 3;

const createAsyncOptions = (setDefault: boolean) =>
    ({
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
                errorFactory: setDefault ? ModuleLevelErrorFactory : undefined
            }
        })
    }) satisfies RateLimiterModuleAsyncOptions;

describe("Custom error factories cascading", () => {
    describe("Override default", () => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule.forRootAsync(createAsyncOptions(false))],
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

    describe("Set as default", () => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule.forRootAsync(createAsyncOptions(true))],
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
