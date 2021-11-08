/**
 * serve --ssl => certificates
 * enables live loading for android9-devices
 *
 * Patch enables clear text traffic for android via "usesCleartextTraffic"
 */

const { join } = require("path");
const { open } = require("fs").promises;
const ci = require("ci-info");

function isAlreadyPatched(content) {
    const match = /android:usesCleartextTraffic="true"/g;
    return content.match(match);
}

async function patch() {
    console.info("Patch Android cleartext permission");

    if (ci.isCI) {
        console.info("Skip Android cleartext permission patch for CI builds");
        return;
    }

    let handle = null;
    const mode = 0o666;

    try {
        const filePath = join(process.cwd(), "platforms", "android", "app", "src", "main", "AndroidManifest.xml");
        const match = /<application/g;
        const replace = '<application android:usesCleartextTraffic="true"'

        handle = await open(filePath, "r", mode);
        const content = await handle.readFile("utf8");

        if (isAlreadyPatched(content)) {
            console.info("Android cleartext permission patch already applied");
            return;
        }

        const patchedManifest = content.replace(match, replace);
        await handle.close();

        // Reopen file handle somehow writeFile starts writing from an internal file pointer which leads to undesired results ...
        handle = await open(filePath, "w", mode);
        await handle.writeFile(patchedManifest, "utf8");

        console.info("Android cleartext permission patch applied");

    } catch (error) {
        if (error.code === "ENOENT") {
            console.info("Skip android permission patch, platform not installed");
            return;
        }

        process.exitCode = 1;
        console.error("Encountered error while patching android manifest: ", error);
    } finally {
        await handle?.close();
    }
}

patch();
