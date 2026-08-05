import { Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard, SkipRateLimit } from "nestjs-rate-limiter";
import { SIGN_IN_CAPACITY } from "../constants";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(RateLimitGuard)
export class UsersController {
    public constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

    @Get()
    @SkipRateLimit()
    public async findAll() {
        return await this.usersService.findAll();
    }

    @Post("sign-in/:index")
    @RateLimit({ strategy: "token-bucket", capacity: SIGN_IN_CAPACITY })
    public signIn(@Param("index") index: string) {
        return this.usersService.singIn(+index);
    }
}
