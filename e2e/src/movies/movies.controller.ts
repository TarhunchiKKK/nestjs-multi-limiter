import { Controller, Get, Inject, Param } from "@nestjs/common";
import { MoviesService } from "./movies.service";

@Controller("movies")
export class MoviesController {
    public constructor(@Inject(MoviesService) private readonly moviesService: MoviesService) {}

    @Get()
    public async findAll() {
        return await this.moviesService.findAll();
    }

    @Get(":id")
    public async findOne(@Param("id") id: string) {
        return await this.moviesService.findOne(id);
    }
}
