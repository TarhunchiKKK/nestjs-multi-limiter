import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Authorization } from "../auth/decorators/authorization.decorator";
import { Authorized } from "../auth/decorators/authorized.decorator";
import type { ChatsService } from "./chats.service";
import type { CreateChatDto } from "./dto/create-chat.dto";
import type { UpdateChatDto } from "./dto/update-chat.dto";

@Controller("chats")
@Authorization()
export class ChatsController {
    public constructor(private readonly chatsService: ChatsService) {}

    @Post()
    public async create(@Authorized() userId: string, @Body() createChatDto: CreateChatDto) {
        return await this.chatsService.create(userId, createChatDto);
    }

    @Get()
    public async findAll(@Authorized() userId: string) {
        return await this.chatsService.findAll(userId);
    }

    @Patch(":chatId")
    public async update(@Param("chatId") id: string, @Body() updateChatDto: UpdateChatDto) {
        return await this.chatsService.update(id, updateChatDto);
    }

    @Delete(":chatId")
    public async remove(@Param("id") id: string) {
        return await this.chatsService.remove(id);
    }
}
