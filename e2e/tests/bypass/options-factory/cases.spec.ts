import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { AppController } from "./controller";
import { RejectOptionsFactory, SkipOptionsFactory } from "./providers";

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

describe("Bypass - Options Factories", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RateLimiterModule.forRootAsync(options)],
            controllers: [AppController],
            providers: [SkipOptionsFactory, RejectOptionsFactory]
        }).compile();

        app = moduleFixture.createNestApplication();

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should skip rate limiting", async () => {
        for (let i = 0; i < LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/skip").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/app/skip").expect(HttpStatus.OK);
    });

    it("should reject rate limiting ", async () => {
        for (let i = 0; i < LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/reject").expect(HttpStatus.TOO_MANY_REQUESTS);
        }

        await request(app.getHttpServer()).get("/app/reject").expect(HttpStatus.TOO_MANY_REQUESTS);
    });
});
