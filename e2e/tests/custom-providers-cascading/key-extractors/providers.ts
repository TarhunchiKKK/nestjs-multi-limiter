import { Controller, type ExecutionContext, Get, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { type IKeyExtractor, KeyExtractor, RateLimit, RateLimitGuard } from "nestjs-multi-limiter";

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

@Controller("module")
@UseGuards(RateLimitGuard)
export class ModuleLevelController {
    @Get("test")
    public test() {
        return { success: true };
    }
}

@Controller("controller")
@UseGuards(RateLimitGuard)
@RateLimit({ keyExtractor: ControllerLevelKeyExtractor })
export class ControllerLevelController {
    @Get("test")
    public test() {
        return { success: true };
    }
}
