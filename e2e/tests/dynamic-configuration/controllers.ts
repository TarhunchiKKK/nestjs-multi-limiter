import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-rate-limiter";
import { RoleBasedOptionsFactory } from "./providers";

@Controller("app")
@UseGuards(RateLimitGuard)
export class AppController {
    @Get("test")
    @RateLimit({ factory: RoleBasedOptionsFactory })
    public test() {
        return { success: true };
    }
}
