import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../middleware/auth.guard";

export function Authorization() {
    return applyDecorators(UseGuards(AuthGuard));
}
