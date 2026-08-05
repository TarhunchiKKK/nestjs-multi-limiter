import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { RateLimiterModule } from "nestjs-rate-limiter";
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
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.getOrThrow("JWT_SECRET"),
                signOptions: {
                    expiresIn: configService.getOrThrow("JWT_EXPIRATION")
                }
            })
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
        UsersModule,
        MoviesModule,
        RedisModule
    ],
    providers: [CustomKeyExtractor, CustomErrorFactory]
})
export class CustomProvidersModule {}
