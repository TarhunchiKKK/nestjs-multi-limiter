import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MoviesModule } from "./movies/movies.module";
import { CustomErrorFactory } from "./providers/custom.error-factory";
import { CustomKeyExtractor } from "./providers/custom.key-extractor";
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
        UsersModule,
        MoviesModule,
        RedisModule
    ],
    providers: [CustomKeyExtractor, CustomErrorFactory]
})
export class CustomProvidersModule {}
