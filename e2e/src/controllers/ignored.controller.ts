import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";

@Controller("ignored")
@UseGuards(RateLimitGuard)
@RateLimit({})
export class IgnoredController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("hello")
    public hello() {
        return this.appService.hello();
    }
}
