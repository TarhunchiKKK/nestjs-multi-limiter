import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import type { User } from "./types/users.types";

@Injectable()
export class UsersService {
    private users: User[];

    public constructor() {
        this.users = Array.from({ length: 20 }).map(() => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            language: faker.helpers.arrayElement(["ru", "en"]),
            subscriptionType: faker.helpers.arrayElement(["standard", "pro"])
        }));
    }

    public async create(user: User) {
        this.users.push(user);

        return await Promise.resolve(user);
    }

    public async findAll() {
        return await Promise.resolve(this.users);
    }

    public async findOne(id: string) {
        const user = this.users.find((user) => user.id === id);

        return await Promise.resolve(user);
    }
}
