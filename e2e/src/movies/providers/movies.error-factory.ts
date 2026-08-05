import { type ExecutionContext, HttpException, HttpStatus, Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { ErrorFactory, type ErrorFactoryOptions, type IErrorFactory } from "nestjs-rate-limiter";
import { UsersService } from "../../users/users.service";

export class MoviesRateLimitException extends HttpException {
    public constructor(message: string) {
        super(message, HttpStatus.TOO_MANY_REQUESTS);
    }
}

@ErrorFactory()
export class MoviesErrorFactory implements IErrorFactory {
    public constructor(
        @Inject(UsersService) private readonly usersService: UsersService,
        @Inject(JwtService) private readonly jwtService: JwtService
    ) {}

    public async getError(context: ExecutionContext, options: ErrorFactoryOptions) {
        const token = this.getToken(context);

        const user = await this.getUser(token);

        switch (user.language) {
            case "ru":
                return new MoviesRateLimitException(`Певышен лимит ля алгоритма ${options.strategy}`);
            case "en":
                return new MoviesRateLimitException(`Limit exhausted for ${options.strategy} strategy`);
        }
    }

    private getToken(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest() as Request;

        const token = request.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedException("Token not found");
        }

        return token;
    }

    private async getUser(token: string) {
        const { id } = this.jwtService.verify(token);

        if (!id) {
            throw new UnauthorizedException("User id cannot be extracted");
        }

        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }
}
