import { Controller, Get, HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory, RateLimit, RateLimitGuard } from "nestjs-multi-limiter";

@ErrorFactory()
export class ControllerLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "controller" }, HttpStatus.TOO_MANY_REQUESTS);
    }
}

@Controller("app")
@UseGuards(RateLimitGuard)
@RateLimit({ errorFactory: ControllerLevelErrorFactory })
export class AppController {
    @Get("test")
    @RateLimit({ scope: "custom-scope" })
    public test() {
        return { success: true };
    }
}
