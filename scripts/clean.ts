import { $ } from "bun";

async function main() {
    await $`bun pm cache rm`;

    // FIX: `bun x` do not work
    await $`bun x rimraf node_modules lib/node_modules e2e/node_modules`;

    await $`bun x rimraf .turbo lib/.turbo e2e/.turbo`;

    await $`bun x rimraf lib/dist e2e/dist`;
}

void main();
