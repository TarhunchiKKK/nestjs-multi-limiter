import { HttpException } from "@nestjs/common";
import { ErrorFactory, type IErrorFactory } from "nestjs-rate-limiter";

@ErrorFactory()
export class ModuleLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "module" }, 429);
    }
}

@ErrorFactory()
export class ControllerLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "controller" }, 429);
    }
}

@ErrorFactory()
export class RouteLevelErrorFactory implements IErrorFactory {
    public getError() {
        return new HttpException({ level: "route" }, 429);
    }
}
