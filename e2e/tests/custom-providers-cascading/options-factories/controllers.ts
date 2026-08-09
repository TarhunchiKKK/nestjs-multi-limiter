import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { ControllerLevelOptionsFactory, RouteLevelOptionsFactory } from "./providers";

@Controller("module")
@UseGuards(RateLimitGuard)
export class ModuleLevelController {
    @Get("test")
    public test() {
        return { success: true };
    }
}

@Controller("controller")
@UseGuards(RateLimitGuard)
@RateLimit({ factory: ControllerLevelOptionsFactory })
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
    @RateLimit({ factory: RouteLevelOptionsFactory })
    public test() {
        return { success: true };
    }
}
