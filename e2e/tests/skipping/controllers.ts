import { Controller, Get, UseGuards } from "@nestjs/common";
import { SkipRateLimit } from "nestjs-rate-limiter";

@Controller("app")
@UseGuards()
export class AppController {
    @Get("test")
    @SkipRateLimit()
    public test() {
        return { success: true };
    }
}
