import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory } from "nestjs-multi-limiter";

@ErrorFactory()
export class ControllerLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "controller" }, HttpStatus.TOO_MANY_REQUESTS);
    }
}
