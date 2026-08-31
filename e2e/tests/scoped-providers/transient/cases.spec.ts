import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { AppController, CustomErrorFactory, CustomKeyExtractor, CustomOptionsFactory, LIMIT } from "./providers";

const options: RateLimiterModuleAsyncOptions = {
    useFactory: () => ({
        storage: {
            type: "in-memory"
        }
    })
};

describe("Transient-scoped-providers", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RateLimiterModule.forRootAsync(options)],
            controllers: [AppController],
            providers: [CustomKeyExtractor, CustomErrorFactory, CustomOptionsFactory]
        }).compile();

        app = moduleFixture.createNestApplication();

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should execute rate limiting", async () => {
        for (let i = 0; i < LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.TOO_MANY_REQUESTS);
    });
});
