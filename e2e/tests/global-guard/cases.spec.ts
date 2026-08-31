import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { Redis } from "ioredis";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions, RateLimitGuard } from "nestjs-multi-limiter";
import request from "supertest";
import { AppController } from "./providers";

const LIMIT = 3;

const options: RateLimiterModuleAsyncOptions = {
    useFactory: () => ({
        storage: {
            type: "redis",
            adapter: new Redis({
                host: "localhost",
                port: 6379
            })
        },
        strategy: "fixed-window",
        strategyOptions: {
            fixedWindow: {
                limit: LIMIT
            }
        }
    })
};

describe("Global guard", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RateLimiterModule.forRootAsync(options)],
            controllers: [AppController],
            providers: [
                {
                    provide: APP_GUARD,
                    useClass: RateLimitGuard
                }
            ]
        }).compile();

        app = moduleFixture.createNestApplication();

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should apply guard globally", async () => {
        for (let i = 0; i < LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.TOO_MANY_REQUESTS);
    });
});
