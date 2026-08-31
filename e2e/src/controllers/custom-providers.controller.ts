import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";
import { CustomErrorFactory } from "../providers/custom.error-factory";
import { CustomKeyExtractor } from "../providers/custom.key-extractor";
import { CustomOptionsFactory } from "../providers/custom.options-factory";

@Controller("dynamic-options")
@UseGuards(RateLimitGuard)
export class CustomProvidersController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("key-extractor")
    @RateLimit({ keyExtractor: CustomKeyExtractor })
    public keyExtractor() {
        return this.appService.hello();
    }

    @Get("error-factory")
    @RateLimit({ errorFactory: CustomErrorFactory })
    public errorFactory() {
        return this.appService.hello();
    }

    @Get("options-factory")
    @RateLimit({ factory: CustomOptionsFactory })
    public optionsFactory() {
        return this.appService.hello();
    }
}
