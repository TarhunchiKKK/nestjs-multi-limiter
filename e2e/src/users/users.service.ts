import { faker } from "@faker-js/faker";
import { Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import type { User } from "./types/users.types";

@Injectable()
export class UsersService {
    private users: User[];

    public constructor(@Inject(AuthService) private readonly authService: AuthService) {
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
            token: this.authService.sign({ id: user.id })
        };
    }
}
