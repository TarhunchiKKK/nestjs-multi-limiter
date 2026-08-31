import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimitGuard } from "nestjs-multi-limiter";

@Controller("non-marked")
@UseGuards(RateLimitGuard)
export class NonMarkedController {
    @Get("hello")
    public hello() {
        return { success: true };
    }
}
