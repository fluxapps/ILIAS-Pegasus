/** serve --ssl => certificates
 * enables live loading for android9-devices
 */

const fs = require("fs");

replaceInFile(
    "platforms/android/app/src/main/AndroidManifest.xml",
    /<application/g,
    '<application android:usesCleartextTraffic="true"'
);

function replaceInFile(file, match, replace) {
    if (fs.existsSync(file)) {
        fs.readFile(file, "utf8", (err,data) => {
            if (err) {
                console.log(err);
                return;
            }
            let result = data.replace(match, replace);
            fs.writeFile(file, result, "utf8", (err) => {
                if (err) {
                    console.log(err)
                }
            });
        });
    } else {
        console.info("Skip android permission patch, platform not installed");
    }
}
