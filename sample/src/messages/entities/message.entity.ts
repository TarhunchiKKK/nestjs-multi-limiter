import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "../../chats/entities/chat.entity";
import type { MessageSender } from "../types/message-sender.type";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: true, default: null })
    public text?: string;

    @Column({ nullable: true, default: null })
    public image?: string;

    @Column()
    public sender: MessageSender;

    @CreateDateColumn()
    public createdAt: Date;

    @ManyToOne(
        () => Chat,
        (chat) => chat.messages
    )
    public chat: Chat;
}
