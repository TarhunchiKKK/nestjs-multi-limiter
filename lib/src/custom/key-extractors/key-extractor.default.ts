import { type ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import type { Request } from "express";
import { KeyExtractor } from "./key-extractor.decorators";
import type { IKeyExtractor } from "./key-extractor.interface";

@KeyExtractor()
export class BuiltinKeyExtractor implements IKeyExtractor {
    public extract(context: ExecutionContext) {
        if (context.getType() !== "http") {
            throw new InternalServerErrorException(`[Rate Limiter]: Expected HTTP context, but found "${context.getType().toUpperCase()}"`);
        }

        const http = context.switchToHttp();

        const request: Request = http.getRequest();

        if (!request) {
            throw new InternalServerErrorException("[Rate Limiter]: Cannot extract request from execution context");
        }

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

        throw new InternalServerErrorException("[Rate Limiter]: Cannot identify client by ip");
    }
}
