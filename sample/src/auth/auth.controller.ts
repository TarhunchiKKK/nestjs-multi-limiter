import { Body, Controller, Patch, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { RateLimit, RateLimitGuard, SkipRateLimit } from "nestjs-multi-limiter";
import type { AuthService } from "./auth.service";
import { Authorization } from "./decorators/authorization.decorator";
import { Authorized } from "./decorators/authorized.decorator";
import type { SignInDto } from "./dto/sign-in.dto";
import type { SignUpDto } from "./dto/sign-up.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { SIGN_IN_RATE_LIMIT_OPTIONS, SIGN_UP_RATE_LIMIT_OPTIONS } from "./rate-limit/rate-limit.constants";

@Controller("auth")
@UseGuards(RateLimitGuard)
export class AuthController {
    public constructor(private readonly authService: AuthService) {}

    // 📌 This endpoint use custom error factory
    @Post("sign-up")
    @RateLimit(SIGN_UP_RATE_LIMIT_OPTIONS)
    public async signUp(@Body() dto: SignUpDto) {
        return await this.authService.signUp(dto);
    }

    // 📌 This endpoint use rate limiter as protection from brute force attack
    @Post("sign-in")
    @RateLimit(SIGN_IN_RATE_LIMIT_OPTIONS)
    public async signIn(@Body() dto: SignInDto) {
        return await this.authService.signIn(dto);
    }

    @Patch()
    @Authorization()
    @SkipRateLimit()
    public async update(@Authorized() userId: string, @Body(ValidationPipe) dto: UpdateUserDto) {
        return await this.authService.update(userId, dto);
    }
}
