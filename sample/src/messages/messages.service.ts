import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { CreateMessageDto } from "./dto/create-message.dto";
import { Message } from "./entities/message.entity";

@Injectable()
export class MessagesService {
    public constructor(@InjectRepository(Message) private readonly messagesRepository: Repository<Message>) {}

    public async create(chatId: string, dto: CreateMessageDto) {
        return await this.messagesRepository.save({
            text: dto.text,
            image: dto.image,
            sender: dto.sender,
            chat: {
                id: chatId
            }
        });
    }

    public async findAll(chatId: string) {
        return await this.messagesRepository.find({
            where: {
                chat: {
                    id: chatId
                }
            },
            relations: {
                chat: true
            },
            select: {
                id: true,
                text: true,
                image: true,
                sender: true,
                createdAt: true
            },
            order: {
                createdAt: "DESC"
            }
        });
    }
}
