import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { ControllerLevelKeyExtractor } from "./providers";

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
@RateLimit({ keyExtractor: ControllerLevelKeyExtractor })
export class ControllerLevelController {
    @Get("test")
    public test() {
        return { success: true };
    }
}
