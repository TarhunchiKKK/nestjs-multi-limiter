import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorFactory } from "./error-factory.decorator";
import type { IErrorFactory } from "./error-factory.interface";

@ErrorFactory()
export class BuiltinErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException("Too many requests.", HttpStatus.TOO_MANY_REQUESTS);
    }
}
