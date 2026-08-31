import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";

@Controller("app")
@UseGuards(RateLimitGuard)
export class AppController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("fixed-window")
    @RateLimit({ strategy: "fixed-window" })
    public fixedWindow() {
        return this.appService.hello();
    }

    @Get("token-bucket")
    @RateLimit({ strategy: "token-bucket" })
    public tokenBucket() {
        return this.appService.hello();
    }

    @Get("sliding-window-counter")
    @RateLimit({ strategy: "sliding-window-counter" })
    public slidingWindowCounter() {
        return this.appService.hello();
    }

    @Get("sliding-window-log")
    @RateLimit({ strategy: "sliding-window-log" })
    public slidingWindowLog() {
        return this.appService.hello();
    }

    @Get("leaky-bucket")
    @RateLimit({ strategy: "leaky-bucket" })
    public leakyBucket() {
        return this.appService.hello();
    }
}
