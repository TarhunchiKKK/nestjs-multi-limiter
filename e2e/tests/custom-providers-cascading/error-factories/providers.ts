import { Controller, Get, HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory, RateLimit, RateLimitGuard } from "nestjs-multi-limiter";

@ErrorFactory()
export class ModuleLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "module" }, HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory()
export class ControllerLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "controller" }, HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory()
export class RouteLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "route" }, HttpStatus.TOO_MANY_REQUESTS);
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
@RateLimit({ errorFactory: ControllerLevelErrorFactory })
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
    @RateLimit({ errorFactory: RouteLevelErrorFactory })
    public test() {
        return { success: true };
    }
}
