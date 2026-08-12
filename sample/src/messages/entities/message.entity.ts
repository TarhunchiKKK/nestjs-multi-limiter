import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: true, default: null })
    public text?: string;

    @Column({ nullable: true, default: null })
    public image?: string;

    @CreateDateColumn()
    public createdAt: Date;

    @ManyToOne(
        () => User,
        (user) => user.messages
    )
    public user: User;
}
