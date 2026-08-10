import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard, SkipRateLimit } from "nestjs-multi-limiter";

@Controller("controller")
@UseGuards(RateLimitGuard)
@SkipRateLimit()
export class ControllerLevelController {
    @Get("test")
    public test() {
        return { success: true };
    }
}

@Controller("route")
@UseGuards(RateLimitGuard)
export class RouteLevelController {
    @Get("test")
    @SkipRateLimit()
    public test() {
        return { success: true };
    }
}

@Controller("execute")
@UseGuards(RateLimitGuard)
@SkipRateLimit()
export class RouteLevelExecuteController {
    @Get("test")
    @RateLimit()
    public test() {
        return { success: true };
    }
}
