import { Controller, Get, UseGuards } from "@nestjs/common";
import { type IOptionsFactory, OptionsFactory, RateLimit, RateLimitGuard, type RateLimitOptions } from "nestjs-multi-limiter";

@OptionsFactory()
export class SkipOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return { bypass: "skip" };
    }
}

@OptionsFactory()
export class RejectOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return { bypass: "reject" };
    }
}

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
