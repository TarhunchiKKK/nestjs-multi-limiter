import { faker } from "@faker-js/faker";
import { Inject, Injectable } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import type { User } from "./types/users.types";

@Injectable()
export class UsersService {
    private users: User[];

    public constructor(@Inject() private readonly jwtService: JwtService) {
        this.users = Array.from({ length: 20 }).map(() => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            language: faker.helpers.arrayElement(["ru", "en"]),
            subscriptionType: faker.helpers.arrayElement(["standard"])
        }));
    }

    public async findAll() {
        return await Promise.resolve(this.users);
    }

    public async findOne(id: string) {
        const user = this.users.find((user) => user.id === id);

        return await Promise.resolve(user);
    }

    public singIn(index: number) {
        const user = this.users[index];

        return {
            token: this.jwtService.signAsync({ id: user.id })
        };
    }
}
