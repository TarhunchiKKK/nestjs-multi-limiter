import { afterEach, beforeEach, describe } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { App } from "supertest/types";
import { BuiltinProvidersModule } from "../src/modules/builtin-providers.module";
import { CustomProvidersModule } from "../src/modules/custom-providers.module";
import { IoRedisAdapter } from "../src/providers/redis.adapter";

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

    // it("/ (GET)", () => {
    //     return request(app.getHttpServer()).get("/").expect(200).expect("Hello World!");
    // });

    afterEach(async () => {
        const redisAdapter = app.get(IoRedisAdapter);

        await redisAdapter.flush();

        await app.close();
    });
});
