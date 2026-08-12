import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { UsersService } from "../users/users.service";
import type { SignInDto } from "./dto/sign-in.dto";
import type { SignUpDto } from "./dto/sign-up.dto";
import type { JwtPayload } from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
    public constructor(
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject(UsersService) private readonly usersService: UsersService
    ) {}

    public async signUp(dto: SignUpDto) {
        const userExists = await this.usersService.findOneByUsername(dto.username);

        if (userExists) {
            throw new ConflictException("User with such username already exists");
        }

        const user = await this.usersService.create(dto);

        const token = this.jwtService.sign<JwtPayload>(user);

        return { user, token };
    }

    public async signIn(dto: SignInDto) {
        const user = await this.usersService.findOneByUsername(dto.username);

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
}
