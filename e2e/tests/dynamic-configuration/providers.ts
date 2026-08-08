import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { type IOptionsFactory, OptionsFactory, type RateLimitOptions } from "nestjs-rate-limiter";

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
                    limit: USER_LIMIT
                };
            }
            case "admin": {
                return {
                    strategy: "fixed-window",
                    limit: ADMIN_LIMIT
                };
            }
            default: {
                throw new Error("No role find in request");
            }
        }
    }
}
