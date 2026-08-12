import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RateLimiterModule } from "nestjs-multi-limiter";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { User } from "./auth/entities/user.entity";
import { JwtKeyExtractor } from "./auth/rate-limit/jwt.key-extractor";
import { ChatsModule } from "./chats/chats.module";
import { Chat } from "./chats/entities/chat.entity";
import { Message } from "./messages/entities/message.entity";
import { MessagesModule } from "./messages/messages.module";
import { RedisModule } from "./redis/redis.module";
import { RedisService } from "./redis/redis.service";
import { AppErrorFactory } from "./shared/app.error-factory";
import { IpKeyExtractor } from "./shared/ip.key-extractor";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                database: configService.getOrThrow("DB_NAME"),
                host: configService.getOrThrow("DB_HOST"),
                port: +configService.getOrThrow("DB_PORT"),
                username: configService.getOrThrow("DB_USERNAME"),
                password: configService.getOrThrow("DB_PASSWORD"),
                synchronize: true,
                entities: [User, Message, Chat]
            })
        }),
        RateLimiterModule.forRootAsync({
            imports: [ConfigModule, RedisModule],
            inject: [ConfigService, RedisService],
            useFactory: (configService: ConfigService, redisService: RedisService) => ({
                scope: configService.getOrThrow<string>("RATE_LIMITING_SCOPE"),
                storage: {
                    type: "redis",
                    adapter: redisService
                },
                defaultProviders: {
                    keyExtractor: JwtKeyExtractor,
                    errorFactory: AppErrorFactory
                }
            })
        }),
        MessagesModule,
        ChatsModule,
        AiModule,
        AuthModule,
        RedisModule
    ],
    providers: [IpKeyExtractor, AppErrorFactory]
})
export class AppModule {}
