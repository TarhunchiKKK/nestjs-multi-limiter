import { Body, Controller, Get, Post } from "@nestjs/common";
import type { CreateMessageDto } from "./dto/create-message.dto";
import type { MessagesService } from "./messages.service";

@Controller("messages")
export class MessagesController {
    public constructor(private readonly messagesService: MessagesService) {}

    @Post()
    public async create(@Body() dto: CreateMessageDto) {
        return await this.messagesService.create(dto);
    }

    @Get()
    public async findAll() {
        return await this.messagesService.findAll();
    }
}
