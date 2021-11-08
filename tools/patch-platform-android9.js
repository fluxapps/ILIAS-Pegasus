/** serve --ssl => certificates
 * enables live loading for android9-devices
 */

const { join } = require("path");
const { open } = require("fs").promises;
const ci = require("ci-info");

if (!ci.isCI) {
    replaceInFile(
        join(process.cwd(), "platforms", "android", "app", "src", "main", "AndroidManifest.xml"),
        /<application/g,
        '<application android:usesCleartextTraffic="true"'
    );
} else {
    console.info("Skip Android cleartext permission patch for CI builds");
}

async function replaceInFile(file, match, replace) {
    try {
        console.info("Patch Android cleartext permission");
        const handle = await open(file, "r", 0o666);
        const content = await handle.readFile("utf8");
        const patchedManifest = content.replace(match, replace);
        await handle.writeFile(patchedManifest, "utf8");
        await handle.close();
        console.info("Android cleartext permission patch applied");
    } catch (error) {
        if (error.code === "ENOENT") {
            console.info("Skip android permission patch, platform not installed");
            return;
        }

        process.exitCode = 1;
        console.error("Encountered error while patching android manifest: ", error);
    }
}
