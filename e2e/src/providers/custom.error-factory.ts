import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory } from "nestjs-rate-limiter";

export class CustomRateLimitException extends HttpException {
    public constructor() {
        super("Custom rate limit exception", HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory()
export class CustomErrorFactory implements IErrorFactory {
    public getError() {
        return new CustomRateLimitException();
    }
}
