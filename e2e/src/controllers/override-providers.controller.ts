import { Controller, Get } from "@nestjs/common";

@Controller("override-providers")
export class OverrideProvidersController {
    @Get("key-extractor")
    public keyExtractor() {}

    @Get("error-factory")
    public errorFactory() {}

    @Get("options-factory")
    public optionsFactory() {}
}
