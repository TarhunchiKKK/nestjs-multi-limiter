import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RateLimiterModule, type RateLimiterModuleAsyncOptions } from "nestjs-multi-limiter";
import request from "supertest";
import { AppController } from "./controllers";
import { ADMIN_LIMIT, RoleBasedOptionsFactory, USER_LIMIT } from "./providers";

const options: RateLimiterModuleAsyncOptions = {
    useFactory: () => ({
        storage: {
            type: "in-memory"
        },
        strategy: "fixed-window",
        strategyOptions: {
            fixedWindow: {
                limit: 1
            }
        }
    })
};

describe("Dynamic options", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RateLimiterModule.forRootAsync(options)],
            controllers: [AppController],
            providers: [RoleBasedOptionsFactory]
        }).compile();

        app = moduleFixture.createNestApplication();

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should dynamically get limit for user", async () => {
        for (let i = 0; i < USER_LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/test").set("Authorization", "user").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/app/test").set("Authorization", "user").expect(HttpStatus.TOO_MANY_REQUESTS);
    });

    it("should dynamically get limit for admin", async () => {
        for (let i = 0; i < ADMIN_LIMIT; i++) {
            await request(app.getHttpServer()).get("/app/test").set("Authorization", "admin").expect(HttpStatus.OK);
        }

        await request(app.getHttpServer()).get("/app/test").set("Authorization", "admin").expect(HttpStatus.TOO_MANY_REQUESTS);
    });
});
