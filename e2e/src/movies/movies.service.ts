import { Injectable } from "@nestjs/common";
import { Movies } from "./movies.data";

@Injectable()
export class MoviesService {
    private readonly movies = Movies;

    public async findAll() {
        return await Promise.resolve(this.movies);
    }

    public async findOne(id: string) {
        const movie = this.movies.find((movie) => movie.id === id);

        return await Promise.resolve(movie);
    }
}
