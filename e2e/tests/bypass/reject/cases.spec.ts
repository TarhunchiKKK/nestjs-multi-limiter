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

describe("Bypass - Reject", () => {
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

    it("should reject rate limiting (controller level)", async () => {
        await request(app.getHttpServer()).get("/controller/test").expect(HttpStatus.TOO_MANY_REQUESTS);
    });

    it("should reject rate limiting (route level)", async () => {
        await request(app.getHttpServer()).get("/route/test").expect(HttpStatus.TOO_MANY_REQUESTS);
    });
});
