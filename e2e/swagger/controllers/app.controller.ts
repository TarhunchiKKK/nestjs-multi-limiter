import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";

@Controller("app")
@ApiTags("App")
@UseGuards(RateLimitGuard)
export class AppController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("fixed-window")
    @ApiOkResponse({ description: "Fixed Window" })
    @RateLimit({ strategy: "fixed-window" })
    public fixedWindow() {
        return this.appService.hello();
    }

    @Get("token-bucket")
    @ApiOkResponse({ description: "Token Bucket" })
    @RateLimit({ strategy: "token-bucket" })
    public tokenBucket() {
        return this.appService.hello();
    }

    @Get("sliding-window-counter")
    @ApiOkResponse({ description: "Sliding Window Counter" })
    @RateLimit({ strategy: "sliding-window-counter" })
    public slidingWindowCounter() {
        return this.appService.hello();
    }

    @Get("sliding-window-log")
    @ApiOkResponse({ description: "Sliding Window Log" })
    @RateLimit({ strategy: "sliding-window-log" })
    public slidingWindowLog() {
        return this.appService.hello();
    }

    @Get("leaky-bucket")
    @ApiOkResponse({ description: "Leaky Bucket" })
    @RateLimit({ strategy: "leaky-bucket" })
    public leakyBucket() {
        return this.appService.hello();
    }
}
