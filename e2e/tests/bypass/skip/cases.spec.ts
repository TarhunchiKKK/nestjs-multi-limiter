import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { ControllerLevelController, RouteLevelController } from "./providers";

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

describe("Bypass - Skip", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RateLimiterModule.forRootAsync(options)],
            controllers: [ControllerLevelController, RouteLevelController]
        }).compile();

        app = moduleFixture.createNestApplication();

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should skip rate limiting (controller level)", async () => {
        for (let i = 0; i < LIMIT; i++) {
            await request(app.getHttpServer()).get("/controller/test").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/controller/test").expect(HttpStatus.OK);
    });

    it("should skip rate limiting (route level)", async () => {
        for (let i = 0; i < LIMIT; i++) {
            await request(app.getHttpServer()).get("/route/test").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/route/test").expect(HttpStatus.OK);
    });
});
