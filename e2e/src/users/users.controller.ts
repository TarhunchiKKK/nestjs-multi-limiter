import { Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard, SkipRateLimit } from "nestjs-rate-limiter";
import { SIGN_IN_CAPACITY } from "../constants";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(RateLimitGuard)
export class UsersController {
    public constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @RateLimit({ strategy: "token-bucket", capacity: SIGN_IN_CAPACITY })
    public async findAll() {
        return await this.usersService.findAll();
    }

    @Post("sign-in/:index")
    @HttpCode(HttpStatus.OK)
    @SkipRateLimit()
    public signIn(@Param("index") index: string) {
        return this.usersService.singIn(+index);
    }
}
