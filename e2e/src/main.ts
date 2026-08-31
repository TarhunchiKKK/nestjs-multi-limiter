import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { RateLimiterSwaggerModule } from "nestjs-multi-limiter/swagger";
import { AppModule } from "./app.module";
import { IgnoredController } from "./controllers/ignored.controller";
import { IgnoredMethodController } from "./controllers/ignored-method.controller";

function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder().setTitle("API").setDescription("API description").setVersion("1.0").build();

    RateLimiterSwaggerModule.patch(app, {
        explicitOnly: true,
        excludeRoutes: [IgnoredController.name, `${IgnoredMethodController.name}.ignore`]
    });

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("docs", app, document);
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    setupSwagger(app);

    await app.listen(3000);

    console.log(`Swagger docs available on: ${await app.getUrl()}/docs`);
}

void bootstrap();
