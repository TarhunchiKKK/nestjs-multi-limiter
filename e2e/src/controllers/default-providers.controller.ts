import { Controller, Get } from "@nestjs/common";

@Controller("default-providers")
export class DefaultProvidersController {
    @Get("key-extractor")
    public keyExtractor() {}

    @Get("error-factory")
    public errorFactory() {}

    @Get("options-factory")
    public optionsFactory() {}
}
