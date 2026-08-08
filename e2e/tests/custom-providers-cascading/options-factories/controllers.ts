import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-rate-limiter";
import { ControllerLevelOptionsFactory, RouteLevelOptionsFactory } from "./providers";

@Controller("module")
@UseGuards(RateLimitGuard)
export class ModuleLevelController {
    @Get("override")
    public override() {
        return { success: true };
    }
}

@Controller("controller")
@UseGuards(RateLimitGuard)
@RateLimit({ factory: ControllerLevelOptionsFactory })
export class ControllerLevelController {
    @Get("override")
    public override() {
        return { success: true };
    }
}

@Controller("route")
@UseGuards(RateLimitGuard)
export class RouteLevelController {
    @Get("override")
    @RateLimit({ factory: RouteLevelOptionsFactory })
    public override() {
        return { success: true };
    }
}
