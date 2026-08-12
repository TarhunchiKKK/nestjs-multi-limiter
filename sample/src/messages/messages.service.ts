import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { CreateMessageDto } from "./dto/create-message.dto";
import { Message } from "./entities/message.entity";

@Injectable()
export class MessagesService {
    public constructor(@InjectRepository(Message) private readonly messagesRepository: Repository<Message>) {}

    public async create(dto: CreateMessageDto) {
        return await this.messagesRepository.save({
            text: dto.text,
            image: dto.image,
            user: {
                id: dto.userId
            }
        });
    }

    public async findAll() {
        return await this.messagesRepository.find();
    }
}
