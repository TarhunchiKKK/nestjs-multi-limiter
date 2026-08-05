import { Module } from "@nestjs/common";
import { MoviesModule } from "./movies/movies.module";
import { RedisModule } from "./redis/redis.module";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [UsersModule, MoviesModule, RedisModule]
})
export class CustomProvidersModule {}
