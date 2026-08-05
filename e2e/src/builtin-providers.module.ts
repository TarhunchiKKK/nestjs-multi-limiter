import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RateLimiterModule } from "nestjs-rate-limiter";
import { AuthModule } from "./auth/auth.module";
import { FIXED_WINDOW_LIMIT, FIXED_WINDOW_TTL, TOKEN_BUCKET_CAPACITY, TOKEN_BUCKET_REFILL_RATE } from "./constants";
import { MoviesModule } from "./movies/movies.module";
import { RedisModule } from "./redis/redis.module";
import { RedisService } from "./redis/redis.service";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        RateLimiterModule.forRootAsync({
            imports: [ConfigModule, RedisModule],
            inject: [ConfigService, RedisService],
            useFactory: (configService: ConfigService) => ({
                scope: configService.getOrThrow("RATE_LIMIT_SCOPE"),
                storage: {
                    type: "redis",
                    adapter: RedisService
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
                }
            })
        }),
        AuthModule,
        UsersModule,
        MoviesModule,
        RedisModule
    ]
})
export class BuiltinProvidersModule {}
