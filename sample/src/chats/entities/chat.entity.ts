import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Message } from "../../messages/entities/message.entity";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    public title: string;

    @CreateDateColumn()
    public createdAt: Date;

    @ManyToOne(
        () => User,
        (user) => user.chats
    )
    public user: User;

    @OneToMany(
        () => Message,
        (message) => message
    )
    public messages: Message[];
}
