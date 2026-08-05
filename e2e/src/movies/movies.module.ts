import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { MoviesErrorFactory } from "./providers/movies.error-factory";
import { MoviesKeyExtractor } from "./providers/movies.key-extractor";
import { MoviesOptionsFactory } from "./providers/movies.options-factory";

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [MoviesController],
    providers: [MoviesService, MoviesKeyExtractor, MoviesErrorFactory, MoviesOptionsFactory],
    exports: [MoviesService, MoviesKeyExtractor, MoviesErrorFactory, MoviesOptionsFactory]
})
export class MoviesModule {}
