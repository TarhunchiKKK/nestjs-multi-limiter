import type { KnipConfig } from "knip";

export default {
    ignore: ["./lib/tests/**/*.ts", "./lib/src/swagger/*.ts", "./lib/src/decorators/index.ts", "./lib/src/shared/model/strategies.ts"],
    ignoreDependencies: ["@nestjs/swagger"],
    rules: {
        files: "error",
        types: "error",
        dependencies: "error",
        devDependencies: "error",
        unlisted: "off"
    }
} satisfies KnipConfig;
