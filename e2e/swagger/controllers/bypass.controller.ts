import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RateLimitGuard, RejectRateLimit, SkipRateLimit } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";

@Controller("bypass")
@ApiTags("Bypass")
@UseGuards(RateLimitGuard)
export class BypassController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("skip")
    @ApiOkResponse({ description: "Skipping" })
    @SkipRateLimit()
    public skip() {
        return this.appService.hello();
    }

    @Get("reject")
    @ApiOkResponse({ description: "Rejecting" })
    @RejectRateLimit()
    public reject() {
        return this.appService.hello();
    }
}
