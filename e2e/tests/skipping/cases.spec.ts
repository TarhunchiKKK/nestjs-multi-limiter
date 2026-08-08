import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule } from "nestjs-rate-limiter";
import request from "supertest";
import { USER_LIMIT } from "../dynamic-configuration/providers";

const LIMIT = 3;

describe("Skipping", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [
                RateLimiterModule.forRoot({
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
            ]
        }).compile();

        app = moduleFixture.createNestApplication();

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should skip rate limiting", async () => {
        for (let i = 0; i < USER_LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/app/test").expect(HttpStatus.OK);
    });
});
