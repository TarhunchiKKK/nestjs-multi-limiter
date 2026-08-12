import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { User } from "./auth/entities/user.entity";
import { ChatsModule } from "./chats/chats.module";
import { Chat } from "./chats/entities/chat.entity";
import { Message } from "./messages/entities/message.entity";
import { MessagesModule } from "./messages/messages.module";
import { RedisModule } from "./redis/redis.module";

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
        MessagesModule,
        ChatsModule,
        AiModule,
        AuthModule,
        RedisModule
    ]
})
export class AppModule {}
