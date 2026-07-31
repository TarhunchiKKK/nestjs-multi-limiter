import { HttpException } from "@nestjs/common";
import { ErrorFactory } from "./error-factory.decorator";
import type { IErrorFactory } from "./error-factory.interface";

@ErrorFactory()
export class BuiltinErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException("Too many requests.", 429);
    }
}
