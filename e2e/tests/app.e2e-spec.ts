import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";
import { BuiltinProvidersModule } from "../src/builtin-providers.module";
import { SIGN_IN_CAPACITY } from "../src/constants";
import { CustomProvidersModule } from "../src/custom-providers.module";
import { RedisService } from "../src/redis/redis.service";

describe.each([
    ["built-in providers", BuiltinProvidersModule],
    ["custom providers", CustomProvidersModule]
])("App (%s)", (_, AppModule) => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();

        app.enableCors();

        await app.init();
    });

    afterEach(async () => {
        const redisService = app.get(RedisService);

        await redisService.flush();

        await app.close();
    });

    describe("/users", () => {
        it("should skip rate limiting", async () => {
            for (let i = 0; i < SIGN_IN_CAPACITY; i++) {
                await request(app.getHttpServer()).get("/users").expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/users").expect(HttpStatus.OK);
        });

        it("should override default capacity", async () => {
            for (let i = 0; i < SIGN_IN_CAPACITY; i++) {
                await request(app.getHttpServer()).get("/users").expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/users").expect(HttpStatus.TOO_MANY_REQUESTS);
        });
    });

    describe("/movies", () => {});
});
