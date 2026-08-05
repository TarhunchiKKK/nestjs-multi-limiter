import { type ExecutionContext, Inject, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { type IKeyExtractor, KeyExtractor } from "nestjs-rate-limiter";

@KeyExtractor()
export class MoviesKeyExtractor implements IKeyExtractor {
    public constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

    public async extract(context: ExecutionContext) {
        const token = this.getToken(context);

        const userId = this.getUserId(token);

        return `movies-${userId}`;
    }

    private getToken(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest() as Request;

        const token = request.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedException("Token not found");
        }

        return token;
    }

    private getUserId(token: string) {
        const { id } = this.jwtService.verify(token);

        if (!id) {
            throw new UnauthorizedException("User id cannot be extracted");
        }

        return id;
    }
}
