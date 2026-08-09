import { type IOptionsFactory, OptionsFactory, type RateLimitOptions } from "nestjs-multi-limiter";

export const MODULE_LEVEL_LIMIT = 3;

export const CONTROLLER_LEVEL_LIMIT = 4;

export const ROUTE_LEVEL_LIMIT = 5;

@OptionsFactory()
export class ModuleLevelOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return {
            strategy: "fixed-window",
            limit: MODULE_LEVEL_LIMIT
        };
    }
}

@OptionsFactory()
export class ControllerLevelOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return {
            strategy: "fixed-window",
            limit: CONTROLLER_LEVEL_LIMIT
        };
    }
}

@OptionsFactory()
export class RouteLevelOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return {
            strategy: "fixed-window",
            limit: ROUTE_LEVEL_LIMIT
        };
    }
}
