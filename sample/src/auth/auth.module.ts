import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "./entities/user.entity";
import { AuthGuard } from "./middleware/auth.guard";
import { BruteForceKeyExtractor } from "./rate-limit/brute-force.key-extractor";
import { JwtKeyExtractor } from "./rate-limit/jwt.key-extractor";
import { TrySignUpLaterOptionsFactory } from "./rate-limit/try-sign-up-later.error-factory";

@Global()
@Module({
    imports: [
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow("JWT_SECRET"),
                signOptions: {
                    expiresIn: configService.getOrThrow("JWT_EXPIRATION")
                }
            })
        }),
        TypeOrmModule.forFeature([User])
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard, JwtKeyExtractor, BruteForceKeyExtractor, TrySignUpLaterOptionsFactory],
    exports: [AuthService, AuthGuard]
})
export class AuthModule {}
