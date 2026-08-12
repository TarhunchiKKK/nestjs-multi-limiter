import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory } from "nestjs-multi-limiter";

export class AppRateLimitException extends HttpException {
    public constructor() {
        super("The number of attempts has expired.", HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory()
export class AppErrorFactory implements IErrorFactory {
    public getError() {
        return new AppRateLimitException();
    }
}
