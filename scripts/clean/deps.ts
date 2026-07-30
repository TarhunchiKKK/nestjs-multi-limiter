import { $ } from "bun";

try {
    await $`bun pm cache rm`;

    console.log("✅ Bun cache deleted");

    await $`bun x rimraf node_modules lib/node_modules e2e/node_modules`;

    console.log('✅ "node_modules" folders deleted');
} catch (error) {
    console.error("❌ Cleaning failed");

    console.error(error);

    process.exitCode = 1;
}
