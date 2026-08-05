import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RateLimiterModule } from "nestjs-rate-limiter";
import { AuthModule } from "./auth/auth.module";
import { FIXED_WINDOW_LIMIT, FIXED_WINDOW_TTL, TOKEN_BUCKET_CAPACITY, TOKEN_BUCKET_REFILL_RATE } from "./constants";
import { MoviesModule } from "./movies/movies.module";
import { CustomErrorFactory } from "./providers/custom.error-factory";
import { CustomKeyExtractor } from "./providers/custom.key-extractor";
import { RedisClient } from "./redis/redis.client";
import { RedisModule } from "./redis/redis.module";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        RateLimiterModule.forRoot({
            scope: "default-scope",
            storage: {
                type: "redis",
                adapter: RedisClient
            },
            strategyOptions: {
                fixedWindow: {
                    limit: FIXED_WINDOW_LIMIT,
                    ttl: FIXED_WINDOW_TTL
                },
                tokenBucket: {
                    capacity: TOKEN_BUCKET_CAPACITY,
                    refillRate: TOKEN_BUCKET_REFILL_RATE
                }
            },
            defaultProviders: {
                keyExtractor: CustomKeyExtractor,
                errorFactory: CustomErrorFactory
            }
        }),
        AuthModule,
        UsersModule,
        MoviesModule,
        RedisModule
    ],
    providers: [CustomKeyExtractor, CustomErrorFactory]
})
export class CustomProvidersModule {}
