import { Controller, type ExecutionContext, Get, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { type IOptionsFactory, OptionsFactory, RateLimit, RateLimitGuard, type RateLimitOptions } from "nestjs-multi-limiter";

export const USER_LIMIT = 3;

export const ADMIN_LIMIT = 5;

@OptionsFactory()
export class RoleBasedOptionsFactory implements IOptionsFactory {
    public getOptions(context: ExecutionContext): RateLimitOptions {
        const request: Request = context.switchToHttp().getRequest();

        const role = request.headers.authorization as "user" | "admin";

        switch (role) {
            case "user": {
                return {
                    strategy: "fixed-window",
                    options: {
                        limit: USER_LIMIT
                    }
                };
            }
            case "admin": {
                return {
                    strategy: "fixed-window",
                    options: {
                        limit: ADMIN_LIMIT
                    }
                };
            }
            default: {
                throw new Error("No role find in request");
            }
        }
    }
}

@Controller("app")
@UseGuards(RateLimitGuard)
export class AppController {
    @Get("test")
    @RateLimit({ factory: RoleBasedOptionsFactory })
    public test() {
        return { success: true };
    }
}
