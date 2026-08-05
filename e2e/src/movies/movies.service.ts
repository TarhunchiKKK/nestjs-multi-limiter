import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import type { Movie } from "./types/movies.types";

@Injectable()
export class MoviesService {
    private readonly movies: Movie[];

    public constructor() {
        this.movies = Array.from({ length: 20 }).map(() => ({
            id: faker.string.uuid(),
            title: faker.lorem.sentence({ min: 1, max: 4 })
        }));
    }

    public async findAll() {
        return await Promise.resolve(this.movies);
    }

    public async findOne(id: string) {
        const movie = this.movies.find((movie) => movie.id === id);

        return await Promise.resolve(movie);
    }
}
