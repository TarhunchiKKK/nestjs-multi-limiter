import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

    public canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const authorization = request.headers.authorization;

        const token = authorization?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedException("Token not found");
        }

        const payload = this.jwtService.verify(token);

        request["user"] = payload;

        return true;
    }
}
