import { BadRequestException, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { type IKeyExtractor, KeyExtractor } from "nestjs-multi-limiter";

@KeyExtractor()
export class BruteForceKeyExtractor implements IKeyExtractor {
    public extract(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const username: string | undefined = request.body?.username;

        if (!username) {
            throw new BadRequestException("Username not provided");
        }

        return username;
    }
}
