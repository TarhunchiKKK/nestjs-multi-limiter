import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "../../chats/entities/chat.entity";
import type { Subscription } from "../types/subscription.type";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public username: string;

    @Column()
    public password: string;

    @Column({ default: "free" })
    public subscription: Subscription;

    @CreateDateColumn()
    public createdAt: Date;

    @OneToMany(
        () => Chat,
        (chat) => chat.user
    )
    public chats: Chat[];
}
