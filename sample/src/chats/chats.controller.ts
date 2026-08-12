import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { MOCK_USER_ID } from "../constants";
import type { ChatsService } from "./chats.service";
import type { CreateChatDto } from "./dto/create-chat.dto";
import type { UpdateChatDto } from "./dto/update-chat.dto";

@Controller("chats")
export class ChatsController {
    public constructor(private readonly chatsService: ChatsService) {}

    @Post()
    public async create(@Body() createChatDto: CreateChatDto) {
        return await this.chatsService.create(createChatDto, MOCK_USER_ID);
    }

    @Get()
    public async findAll() {
        return await this.chatsService.findAll(MOCK_USER_ID);
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
