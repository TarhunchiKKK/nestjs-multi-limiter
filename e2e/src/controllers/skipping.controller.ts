import { Controller, Get } from "@nestjs/common";

@Controller("skipping")
export class SkippingController {
    @Get("skip")
    public skip() {}
}
