import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MoviesModule } from "./movies/movies.module";
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
    ]
})
export class BuiltinProvidersModule {}
