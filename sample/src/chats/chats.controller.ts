import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { Authorization } from "../auth/decorators/authorization.decorator";
import { Authorized } from "../auth/decorators/authorized.decorator";
import type { ChatsService } from "./chats.service";
import type { CreateChatDto } from "./dto/create-chat.dto";
import type { UpdateChatDto } from "./dto/update-chat.dto";
import { CHATS_READ_RATE_LIMIT_OPTIONS, CHATS_WRITE_RATE_LIMIT_OPTIONS } from "./rate-limit/rate-limit.constants";

@Controller("chats")
@Authorization()
@UseGuards(RateLimitGuard)
export class ChatsController {
    public constructor(private readonly chatsService: ChatsService) {}

    @Post()
    @RateLimit(CHATS_WRITE_RATE_LIMIT_OPTIONS)
    public async create(@Authorized() userId: string, @Body(ValidationPipe) dto: CreateChatDto) {
        return await this.chatsService.create(userId, dto);
    }

    @Get()
    @RateLimit(CHATS_READ_RATE_LIMIT_OPTIONS)
    public async findAll(@Authorized() userId: string) {
        return await this.chatsService.findAll(userId);
    }

    @Patch(":chatId")
    @RateLimit(CHATS_WRITE_RATE_LIMIT_OPTIONS)
    public async update(@Param("chatId") id: string, @Body(ValidationPipe) dto: UpdateChatDto) {
        return await this.chatsService.update(id, dto);
    }

    @Delete(":chatId")
    @RateLimit(CHATS_WRITE_RATE_LIMIT_OPTIONS)
    public async remove(@Param("id") id: string) {
        return await this.chatsService.remove(id);
    }
}
