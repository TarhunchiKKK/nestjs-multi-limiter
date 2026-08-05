import { type ExecutionContext, Inject, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { type IKeyExtractor, KeyExtractor } from "nestjs-rate-limiter";
import { AuthService } from "../../auth/auth.service";

@KeyExtractor()
export class MoviesKeyExtractor implements IKeyExtractor {
    public constructor(@Inject(AuthService) private readonly authService: AuthService) {}

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
        const { id } = this.authService.verify(token);

        if (!id) {
            throw new UnauthorizedException("User id cannot be extracted");
        }

        return id;
    }
}
