import { type ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import type { Request } from "express";
import { type IKeyExtractor, KeyExtractor } from "nestjs-multi-limiter";

@KeyExtractor()
export class IpKeyExtractor implements IKeyExtractor {
    public extract(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        if (request.ip) {
            return request.ip;
        }

        const xForwarderFor = request.headers["x-forwarded-for"];

        if (xForwarderFor) {
            const ipString = Array.isArray(xForwarderFor) ? xForwarderFor[0] : xForwarderFor;

            const key = ipString?.split(",")[0]?.trim();

            if (key) {
                return key;
            }
        }

        throw new InternalServerErrorException("Cannot identify user by ip.");
    }
}
