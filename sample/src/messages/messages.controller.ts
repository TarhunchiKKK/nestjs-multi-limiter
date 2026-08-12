import { Controller, Get, Param } from "@nestjs/common";
import type { MessagesService } from "./messages.service";

@Controller("messages")
export class MessagesController {
    public constructor(private readonly messagesService: MessagesService) {}

    @Get(":chatId")
    public async findAll(@Param("chatId") chatId: string) {
        return await this.messagesService.findAll(chatId);
    }
}
