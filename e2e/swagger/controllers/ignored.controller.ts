import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";

@Controller("ignored")
@ApiTags("Ignored Controller")
@UseGuards(RateLimitGuard)
@RateLimit({})
export class IgnoredController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("hello")
    @ApiOkResponse({ description: "Should be ignored" })
    public hello() {
        return this.appService.hello();
    }
}
