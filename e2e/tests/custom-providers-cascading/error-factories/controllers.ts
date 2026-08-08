import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-rate-limiter";
import { ControllerLevelErrorFactory, RouteLevelErrorFactory } from "./providers";

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
@RateLimit({ errorFactory: ControllerLevelErrorFactory })
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
    @RateLimit({ errorFactory: RouteLevelErrorFactory })
    public override() {
        return { success: true };
    }
}
