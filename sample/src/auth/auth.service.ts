import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import type { Repository } from "typeorm";
import type { SignInDto } from "./dto/sign-in.dto";
import type { SignUpDto } from "./dto/sign-up.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import type { JwtPayload } from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
    public constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @Inject(JwtService) private readonly jwtService: JwtService
    ) {}

    public async signUp(dto: SignUpDto) {
        const userExists = await this.findOneByUsername(dto.username);

        if (userExists) {
            throw new ConflictException("User with such username already exists");
        }

        const passwordHash = await argon2.hash(dto.password);

        const user = await this.usersRepository.save({
            username: dto.username,
            password: passwordHash
        });

        const token = this.jwtService.sign<JwtPayload>(user);

        return { user, token };
    }

    public async signIn(dto: SignInDto) {
        const user = await this.findOneByUsername(dto.username);

        if (!user) {
            throw new NotFoundException("User with such username not found.");
        }

        const passwordsMatch = await argon2.verify(user.password, dto.password);

        if (!passwordsMatch) {
            throw new BadRequestException("Passwords not match.");
        }

        const token = this.jwtService.sign<JwtPayload>(user);

        return { user, token };
    }

    public async findOneById(id: string) {
        const user = await this.usersRepository.findOne({
            where: {
                id: id
            }
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    public async update(userId: string, dto: UpdateUserDto) {
        const user = await this.usersRepository.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        Object.assign(user, dto);

        return await this.usersRepository.save(user);
    }

    private async findOneByUsername(username: string) {
        return await this.usersRepository.findOne({
            where: {
                username: username
            }
        });
    }
}
