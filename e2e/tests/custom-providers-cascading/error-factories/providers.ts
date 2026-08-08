import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory } from "nestjs-rate-limiter";

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
