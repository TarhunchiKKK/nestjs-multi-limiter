import { $ } from "bun";

try {
    console.log("🚀 Starting containers...");

    await $`docker compose -f ./scripts/docker-compose.yaml up --wait`;

    console.log("🧪 Running tests...");

    await $`turbo run test:e2e`;

    console.log("✅ Tests succeed");
} catch (_) {
    console.error("❌ Tests failed");

    process.exitCode = 1;
} finally {
    console.log("🧹 Stopping containers...");

    await $`docker compose -f ./scripts/docker-compose.yaml down -v`;

    console.log("✅ Containers stopped");
}
