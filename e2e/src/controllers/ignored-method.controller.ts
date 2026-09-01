import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";

@Controller("ignored-method")
@ApiTags("Ignored MEthod")
@UseGuards(RateLimitGuard)
@RateLimit({})
export class IgnoredMethodController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("hello")
    @ApiOkResponse({ description: "Should not be ignored" })
    public hello() {
        return this.appService.hello();
    }

    @Get("ignore")
    @ApiOkResponse({ description: "Should be ignored" })
    public ignore() {
        return this.appService.hello();
    }
}
