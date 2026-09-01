import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory } from "nestjs-multi-limiter";

export class CustomRateLimitException extends HttpException {
    public constructor() {
        super("Too many requests", HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory()
export class CustomErrorFactory implements IErrorFactory {
    public getError() {
        return new CustomRateLimitException();
    }
}
