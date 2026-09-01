import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { AppService } from "../providers/app.service";
import { CustomErrorFactory } from "../providers/custom.error-factory";
import { CustomKeyExtractor } from "../providers/custom.key-extractor";
import { CustomOptionsFactory } from "../providers/custom.options-factory";

@Controller("custom-providers")
@ApiTags("Custom Providers")
@UseGuards(RateLimitGuard)
export class CustomProvidersController {
    public constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get("key-extractor")
    @ApiOkResponse({ description: "Custom KEy Extractor" })
    @RateLimit({ keyExtractor: CustomKeyExtractor })
    public keyExtractor() {
        return this.appService.hello();
    }

    @Get("error-factory")
    @ApiOkResponse({ description: "Custom Error Factory" })
    @RateLimit({ errorFactory: CustomErrorFactory })
    public errorFactory() {
        return this.appService.hello();
    }

    @Get("options-factory")
    @ApiOkResponse({ description: "Custom Options Factory" })
    @RateLimit({ factory: CustomOptionsFactory })
    public optionsFactory() {
        return this.appService.hello();
    }
}
