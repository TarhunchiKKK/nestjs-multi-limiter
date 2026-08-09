import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { type IKeyExtractor, KeyExtractor } from "nestjs-multi-limiter";

@KeyExtractor()
export class ModuleLevelKeyExtractor implements IKeyExtractor {
    public extract(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const header = request.headers["module-id"];

        if (!header) {
            return "anonymous-module";
        }

        if (Array.isArray(header)) {
            return header[0];
        }

        return header;
    }
}

@KeyExtractor()
export class ControllerLevelKeyExtractor implements IKeyExtractor {
    public extract(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const header = request.headers["controller-id"];

        if (!header) {
            return "anonymous-module";
        }

        if (Array.isArray(header)) {
            return header[0];
        }

        return header;
    }
}
