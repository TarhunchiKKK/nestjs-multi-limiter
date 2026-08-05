import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-rate-limiter";
import { FIXED_WINDOW_LIMIT } from "../constants";
import { MoviesService } from "./movies.service";
import { MoviesErrorFactory } from "./providers/movies.error-factory";
import { MoviesKeyExtractor } from "./providers/movies.key-extractor";
import { MoviesOptionsFactory } from "./providers/movies.options-factory";

@Controller("movies")
@UseGuards(RateLimitGuard)
@RateLimit({ strategy: "fixed-window", scope: "movies", errorFactory: MoviesErrorFactory })
export class MoviesController {
    public constructor(@Inject(MoviesService) private readonly moviesService: MoviesService) {}

    @Get()
    @RateLimit({ strategy: "fixed-window", limit: FIXED_WINDOW_LIMIT })
    public async findAll() {
        return await this.moviesService.findAll();
    }

    @Get(":id")
    @RateLimit({ ttl: 24 * 60 * 1000, keyExtractor: MoviesKeyExtractor, factory: MoviesOptionsFactory })
    public async findOne(@Param("id") id: string) {
        return await this.moviesService.findOne(id);
    }
}
