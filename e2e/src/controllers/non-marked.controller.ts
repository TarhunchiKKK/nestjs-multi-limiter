import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RateLimitGuard } from "nestjs-multi-limiter";

@Controller("non-marked")
@ApiTags("Non-Marked")
@UseGuards(RateLimitGuard)
export class NonMarkedController {
    @Get("hello")
    @ApiOkResponse({ description: "Should be excluded (no explicit decorator)" })
    public hello() {
        return { success: true };
    }
}
