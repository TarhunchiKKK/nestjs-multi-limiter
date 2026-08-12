import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { Authorization } from "../auth/decorators/authorization.decorator";
import type { MessagesService } from "./messages.service";
import { MESSAGES_READ_RATE_LIMIT_OPTIONS } from "./rate-limit/rate-limit.constants";

@Controller("messages")
@Authorization()
@UseGuards(RateLimitGuard)
export class MessagesController {
    public constructor(private readonly messagesService: MessagesService) {}

    @Get(":chatId")
    @RateLimit(MESSAGES_READ_RATE_LIMIT_OPTIONS)
    public async findAll(@Param("chatId") chatId: string) {
        return await this.messagesService.findAll(chatId);
    }
}
