import { join } from "node:path";

const DESTINATION_DIR = "lib";
const FILENAMES = ["readme.md", "license", "contributing.md"];

for (const filename of FILENAMES) {
    const srcFile = Bun.file(filename);

    const destFile = Bun.file(join(DESTINATION_DIR, filename));

    await Bun.write(destFile, srcFile);

    console.log(`✅ '${DESTINATION_DIR}/${filename}' updated!`);
}
