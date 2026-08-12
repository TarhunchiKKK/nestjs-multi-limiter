import type { Subscription } from "rxjs";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "../../chats/entities/chat.entity";

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
