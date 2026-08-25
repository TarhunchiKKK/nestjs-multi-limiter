import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard, RejectRateLimit } from "nestjs-multi-limiter";

@Controller("controller")
@UseGuards(RateLimitGuard)
@RejectRateLimit()
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
    @RejectRateLimit()
    public test() {
        return { success: true };
    }
}

@Controller("execute")
@UseGuards(RateLimitGuard)
@RejectRateLimit()
export class RouteLevelExecuteController {
    @Get("test")
    @RateLimit({})
    public test() {
        return { success: true };
    }
}
