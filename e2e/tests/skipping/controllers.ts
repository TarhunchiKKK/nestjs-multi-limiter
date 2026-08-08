import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimitGuard, SkipRateLimit } from "nestjs-rate-limiter";

@Controller("app")
@UseGuards(RateLimitGuard)
export class AppController {
    @Get("test")
    @SkipRateLimit()
    public test() {
        return { success: true };
    }
}
