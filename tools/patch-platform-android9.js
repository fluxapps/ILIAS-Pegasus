/** serve --ssl => certificates
 * enables live loading for android9-devices
 */

const { open } = require("fs").promises;

replaceInFile(
    "platforms/android/app/src/main/AndroidManifest.xml",
    /<application/g,
    '<application android:usesCleartextTraffic="true"'
);

async function replaceInFile(file, match, replace) {
    try {
        console.info("Patch Android cleartext permission");
        const handle = await open(file, 0o666);
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
