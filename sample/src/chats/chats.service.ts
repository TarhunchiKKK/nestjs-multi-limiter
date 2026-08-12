import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { CreateChatDto } from "./dto/create-chat.dto";
import type { UpdateChatDto } from "./dto/update-chat.dto";
import { Chat } from "./entities/chat.entity";

@Injectable()
export class ChatsService {
    public constructor(@InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>) {}

    public async create(userId: string, dto: CreateChatDto) {
        const chatExists = await this.chatsRepository.exists({
            where: {
                user: {
                    id: userId
                },
                title: dto.title
            },
            relations: {
                user: true
            }
        });

        if (chatExists) {
            throw new ConflictException("Chat with such title already exists");
        }

        return await this.chatsRepository.save({
            title: dto.title,
            user: {
                id: userId
            }
        });
    }

    public async findAll(userId: string) {
        return await this.chatsRepository.find({
            where: {
                user: {
                    id: userId
                }
            },
            relations: {
                user: true
            },
            select: {
                id: true,
                title: true,
                createdAt: true
            },
            order: {
                createdAt: "DESC"
            }
        });
    }

    public async update(id: string, dto: UpdateChatDto) {
        const chat = await this.chatsRepository.findOne({
            where: {
                id: id
            }
        });

        if (!chat) {
            throw new NotFoundException("chat not found");
        }

        Object.assign(chat, dto);

        return await this.chatsRepository.save(chat);
    }

    public async remove(id: string) {
        const chat = await this.chatsRepository.findOne({
            where: {
                id: id
            }
        });

        if (!chat) {
            throw new NotFoundException("chat not found");
        }

        return await this.chatsRepository.remove(chat);
    }
}
