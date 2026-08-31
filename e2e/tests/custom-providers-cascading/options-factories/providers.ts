import { Controller, Get, UseGuards } from "@nestjs/common";
import { type IOptionsFactory, OptionsFactory, RateLimit, RateLimitGuard, type RateLimitOptions } from "nestjs-multi-limiter";

export const MODULE_LEVEL_LIMIT = 3;

export const CONTROLLER_LEVEL_LIMIT = 4;

export const ROUTE_LEVEL_LIMIT = 5;

@OptionsFactory()
export class ModuleLevelOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return {
            strategy: "fixed-window",
            options: {
                limit: MODULE_LEVEL_LIMIT
            }
        };
    }
}

@OptionsFactory()
export class ControllerLevelOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return {
            strategy: "fixed-window",
            options: {
                limit: CONTROLLER_LEVEL_LIMIT
            }
        };
    }
}

@OptionsFactory()
export class RouteLevelOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return {
            strategy: "fixed-window",
            options: {
                limit: ROUTE_LEVEL_LIMIT
            }
        };
    }
}

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
