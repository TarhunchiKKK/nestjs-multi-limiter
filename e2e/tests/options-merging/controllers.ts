import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { ControllerLevelErrorFactory } from "./providers";

@Controller("app")
@UseGuards(RateLimitGuard)
@RateLimit({ errorFactory: ControllerLevelErrorFactory })
export class AppController {
    @Get("test")
    @RateLimit({ scope: "custom-scope" })
    public test() {
        return { success: true };
    }
}
