import { type ExecutionContext, Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { type IOptionsFactory, OptionsFactory, type RateLimitOptions } from "nestjs-rate-limiter";
import { UsersService } from "../../users/users.service";

@OptionsFactory()
export class MoviesOptionsFactory implements IOptionsFactory {
    private readonly standardSubscriptionLimit: number;
    private readonly proSubscriptionLimit: number;

    public constructor(
        @Inject(UsersService) private readonly usersService: UsersService,
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject(ConfigService) private readonly configService: ConfigService
    ) {
        this.standardSubscriptionLimit = +this.configService.getOrThrow("STANDARD_SUBSCRIPTION_LIMIT");
        this.proSubscriptionLimit = +this.configService.getOrThrow("PRO_SUBSCRIPTION_LIMIT");
    }

    public async getOptions(context: ExecutionContext): Promise<RateLimitOptions> {
        const token = this.getToken(context);

        const user = await this.getUser(token);

        switch (user.subscriptionType) {
            case "standard":
                return {
                    strategy: "fixed-window",
                    limit: this.standardSubscriptionLimit
                };
            case "pro":
                return {
                    strategy: "fixed-window",
                    limit: this.proSubscriptionLimit
                };
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
