import { type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { type IKeyExtractor, KeyExtractor } from "nestjs-rate-limiter";

@KeyExtractor()
export class CustomKeyExtractor implements IKeyExtractor {
    public async extract(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest() as Request;

        const token = request.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedException("Token not found");
        }

        return token;
    }
}
