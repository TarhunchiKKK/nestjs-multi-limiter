import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { RateLimitGuard, RejectRateLimit, SkipRateLimit } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";

@Controller("bypass")
@UseGuards(RateLimitGuard)
export class BypassController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("skip")
    @SkipRateLimit()
    public skip() {
        return this.appService.hello();
    }

    @Get("reject")
    @RejectRateLimit()
    public reject() {
        return this.appService.hello();
    }
}
