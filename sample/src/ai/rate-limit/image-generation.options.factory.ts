import { type ExecutionContext, Inject } from "@nestjs/common";
import { type IOptionsFactory, OptionsFactory, type RateLimitOptions } from "nestjs-multi-limiter";
import { AuthService } from "../../auth/auth.service";
import { getIdFromRequest } from "../../auth/helpers/get-id-from-request.helper";
import { MS_IN_DAY } from "../../shared/time.constants";

const baseOptions: RateLimitOptions = {
    strategy: "token-bucket",
    ttl: 1 * MS_IN_DAY
};

@OptionsFactory()
export class ImageGenerationOptionsFactory implements IOptionsFactory {
    public constructor(@Inject(AuthService) private readonly authService: AuthService) {}

    public async getOptions(context: ExecutionContext): Promise<RateLimitOptions> {
        const userId = getIdFromRequest(context);

        const user = await this.authService.findOneById(userId);

        switch (user.subscription) {
            case "free": {
                return {
                    ...baseOptions,
                    capacity: 5
                };
            }
            case "pro": {
                return {
                    ...baseOptions,
                    capacity: 80
                };
            }
            case "enterprise": {
                return {
                    ...baseOptions,
                    capacity: 200
                };
            }
        }
    }
}
