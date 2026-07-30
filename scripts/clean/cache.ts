import { $ } from "bun";

try {
    await $`bun x rimraf .turbo lib/.turbo e2e/.turbo`;

    console.log('✅ ".turbo" folders deleted');

    await $`bun x rimraf lib/dist e2e/dist`;

    console.log('✅ "dist" folders deleted');
} catch (error) {
    console.error("❌ Cleaning failed");

    console.error(error);

    process.exitCode = 1;
}
