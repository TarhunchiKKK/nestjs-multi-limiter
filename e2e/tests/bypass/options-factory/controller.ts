import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { RejectOptionsFactory, SkipOptionsFactory } from "./providers";

@Controller("app")
@UseGuards(RateLimitGuard)
export class AppController {
    @Get("skip")
    @RateLimit({ factory: SkipOptionsFactory })
    public skip() {
        return { success: true };
    }

    @Get("reject")
    @RateLimit({ factory: RejectOptionsFactory })
    public reject() {
        return { success: true };
    }
}
