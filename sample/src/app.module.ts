import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./messages/entities/message.entity";
import { MessagesModule } from "./messages/messages.module";
import { User } from "./users/entities/user.entity";
import { UsersModule } from "./users/users.module";

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
                entities: [User, Message]
            })
        }),
        UsersModule,
        MessagesModule
    ]
})
export class AppModule {}
