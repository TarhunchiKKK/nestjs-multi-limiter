import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import type { Repository } from "typeorm";
import type { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
    public constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

    public async create(dto: CreateUserDto) {
        const userExists = await this.usersRepository.exists({
            where: {
                username: dto.username
            }
        });

        if (userExists) {
            throw new ConflictException("User with such username already exists.");
        }

        const passwordHash = await argon2.hash(dto.password);

        return await this.usersRepository.save({
            username: dto.username,
            password: passwordHash
        });
    }

    public async findOne(id: string) {
        const user = await this.usersRepository.findOne({
            where: {
                id: id
            }
        });

        if (!user) {
            throw new NotFoundException("User not found.");
        }

        return user;
    }
}
