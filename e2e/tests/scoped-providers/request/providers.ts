import { Controller, Get, HttpException, HttpStatus, Scope, UseGuards } from "@nestjs/common";
import {
    type DynamicRateLimitOptions,
    ErrorFactory,
    type IErrorFactory,
    type IKeyExtractor,
    type IOptionsFactory,
    KeyExtractor,
    OptionsFactory,
    RateLimit,
    RateLimitGuard
} from "nestjs-multi-limiter";

export const LIMIT = 3;

@KeyExtractor({ scope: Scope.REQUEST })
export class CustomKeyExtractor implements IKeyExtractor {
    public extract() {
        return "key";
    }
}

export class CustomRateLimitError extends HttpException {
    public constructor() {
        super("Too many requests.", HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory({ scope: Scope.REQUEST })
export class CustomErrorFactory implements IErrorFactory {
    public getError() {
        return new CustomRateLimitError();
    }
}

@OptionsFactory({ scope: Scope.REQUEST })
export class CustomOptionsFactory implements IOptionsFactory {
    public getOptions(): DynamicRateLimitOptions {
        return {
            strategy: "fixed-window",
            options: {
                limit: LIMIT,
                ttl: 1000
            }
        };
    }
}

@Controller("app")
@UseGuards(RateLimitGuard)
@RateLimit({ keyExtractor: CustomKeyExtractor, errorFactory: CustomErrorFactory, factory: CustomOptionsFactory })
export class AppController {
    @Get("test")
    public test() {
        return { success: true };
    }
}
