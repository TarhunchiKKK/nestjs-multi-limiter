import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { AppController } from "./controllers";
import { ControllerLevelErrorFactory } from "./providers";

const LIMIT = 3;

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
        }
    })
};

describe("Custom error factories cascading", () => {
    describe("Override default", () => {
        let app: INestApplication;

        beforeEach(async () => {
            const moduleFixture = await Test.createTestingModule({
                imports: [RateLimiterModule.forRootAsync(options)],
                controllers: [AppController],
                providers: [ControllerLevelErrorFactory]
            }).compile();

            app = moduleFixture.createNestApplication();

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it("should use controller-level error factory", async () => {
            for (let i = 0; i < LIMIT; i++) {
                await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.OK);
            }

            const response = await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.TOO_MANY_REQUESTS);
            expect(response.body.level).toBe("controller");
        });
    });
});
