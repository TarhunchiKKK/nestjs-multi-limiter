import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { ControllerLevelController, ModuleLevelController, RouteLevelController } from "./controllers";
import {
    CONTROLLER_LEVEL_LIMIT,
    ControllerLevelOptionsFactory,
    MODULE_LEVEL_LIMIT,
    ModuleLevelOptionsFactory,
    ROUTE_LEVEL_LIMIT,
    RouteLevelOptionsFactory
} from "./providers";

const DEFAULT_LIMIT = 3;

const createAsyncOptions = (setDefault: boolean) =>
    ({
        useFactory: () => ({
            storage: {
                type: "in-memory"
            },
            strategy: "fixed-window",
            strategyOptions: {
                fixedWindow: {
                    limit: DEFAULT_LIMIT
                }
            },
            defaultProviders: {
                optionsFactory: setDefault ? ModuleLevelOptionsFactory : undefined
            }
        })
    }) satisfies RateLimiterModuleAsyncOptions;

describe("Custom options factories cascading", () => {
    describe("Override default", () => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule.forRootAsync(createAsyncOptions(false))],
                controllers: [ModuleLevelController, ControllerLevelController, RouteLevelController],
                providers: [ControllerLevelOptionsFactory, RouteLevelOptionsFactory]
            }).compile();

            app = moduleFixture.createNestApplication();

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it("should use built-in options factory (undefined)", async () => {
            for (let i = 0; i < DEFAULT_LIMIT; i++) {
                await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.TOO_MANY_REQUESTS);
        });

        it("should use controller-level options factory", async () => {
            for (let i = 0; i < CONTROLLER_LEVEL_LIMIT; i++) {
                await request(app.getHttpServer()).get("/controller/test").expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/controller/test").expect(HttpStatus.TOO_MANY_REQUESTS);
        });

        it("should use route-level options factory", async () => {
            for (let i = 0; i < ROUTE_LEVEL_LIMIT; i++) {
                await request(app.getHttpServer()).get("/route/test").expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/route/test").expect(HttpStatus.TOO_MANY_REQUESTS);
        });
    });

    describe("Set as default", () => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule.forRootAsync(createAsyncOptions(false))],
                controllers: [ModuleLevelController],
                providers: [ModuleLevelOptionsFactory]
            }).compile();

            app = moduleFixture.createNestApplication();

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it("should use module-level options factory", async () => {
            for (let i = 0; i < MODULE_LEVEL_LIMIT; i++) {
                await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/module/test").expect(HttpStatus.TOO_MANY_REQUESTS);
        });
    });
});
