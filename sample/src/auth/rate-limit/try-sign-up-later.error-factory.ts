import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory } from "nestjs-multi-limiter";

class TrySignUpLaterException extends HttpException {
    public constructor() {
        super("The number of registration attempts has expired. Try again later.", HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory()
export class TrySignUpLaterOptionsFactory implements IErrorFactory {
    public getError() {
        return new TrySignUpLaterException();
    }
}
