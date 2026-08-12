import { type ExecutionContext, UnauthorizedException } from "@nestjs/common";

export function getIdFromRequest(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    // biome-ignore lint/complexity/useLiteralKeys: This field appears in runtime.
    const userId = request["user"]?.id;

    if (!userId) {
        throw new UnauthorizedException("Jwt payload not found.");
    }

    return userId;
}
