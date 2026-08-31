import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";
import { CustomOptionsFactory } from "../providers/custom.options-factory";

@Controller("dynamic-options")
@UseGuards(RateLimitGuard)
export class DynamicOptionsController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("hello")
    @RateLimit({ factory: CustomOptionsFactory })
    public hello() {
        return this.appService.hello();
    }
}
