import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { Redis } from "ioredis";
import { RateLimiterModule, RateLimitGuard } from "nestjs-multi-limiter";
import request from "supertest";
import { USER_LIMIT } from "../dynamic-configuration/providers";
import { AppController } from "./controllers";

const LIMIT = 3;

const RedisAdapter = new Redis({
    host: "localhost",
    port: 6379
});

describe("Global guard", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [
                RateLimiterModule.forRoot({
                    storage: {
                        type: "redis",
                        adapter: RedisAdapter
                    },
                    strategy: "fixed-window",
                    strategyOptions: {
                        fixedWindow: {
                            limit: LIMIT
                        }
                    }
                })
            ],
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
        for (let i = 0; i < USER_LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.TOO_MANY_REQUESTS);
    });
});
