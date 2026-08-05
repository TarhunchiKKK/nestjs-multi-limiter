import { afterEach, beforeEach, describe, it } from "bun:test";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";
import { BuiltinProvidersModule } from "../src/builtin-providers.module";
import { SIGN_IN_CAPACITY } from "../src/constants";
import { CustomProvidersModule } from "../src/custom-providers.module";
import { RedisService } from "../src/redis/redis.service";

describe.each([
    ["BuiltinProvidersModule", BuiltinProvidersModule],
    ["CustomProvidersModule", CustomProvidersModule]
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
            const token = "jwt";

            for (let i = 0; i < SIGN_IN_CAPACITY; i++) {
                await request(app.getHttpServer()).get("/users").set("Authorization", `Bearer ${token}`).expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/users").set("Authorization", `Bearer ${token}`).expect(HttpStatus.TOO_MANY_REQUESTS);
        });

        it("should override default capacity", async () => {
            const token = "jwt";

            for (let i = 0; i < SIGN_IN_CAPACITY; i++) {
                await request(app.getHttpServer()).post("/users/sign-in/:0").set("Authorization", `Bearer ${token}`).expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).post("/users/sign-in/:0").set("Authorization", `Bearer ${token}`).expect(HttpStatus.OK);
        });
    });

    describe("/movies", () => {
        it("should override default limit", async () => {
            const { token } = (await request(app.getHttpServer()).post("/users/sign-in/:0").set("Authorization", `Bearer jwt`)).body;

            for (let i = 0; i < SIGN_IN_CAPACITY; i++) {
                await request(app.getHttpServer()).get("/movies").set("Authorization", `Bearer ${token}`).expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/movies").set("Authorization", `Bearer ${token}`).expect(HttpStatus.TOO_MANY_REQUESTS);
        });

        it("should use dynamic options factory", async () => {
            const configService = app.get(ConfigService);

            const standardLimit = +configService.getOrThrow<string>("STANDARD_SUBSCRIPTION_LIMIT");

            const { token } = (await request(app.getHttpServer()).post("/users/sign-in/:0").set("Authorization", `Bearer jwt`)).body;

            for (let i = 0; i < standardLimit; i++) {
                await request(app.getHttpServer()).get("/movies/0").set("Authorization", `Bearer ${token}`).expect(HttpStatus.OK);
            }

            await request(app.getHttpServer()).get("/movies/0").set("Authorization", `Bearer ${token}`).expect(HttpStatus.TOO_MANY_REQUESTS);
        });
    });
});
