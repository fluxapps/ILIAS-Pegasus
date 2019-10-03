/**
 * enables live loading for android9-devices
 */

const fs = require("fs");

replaceInFile(
    "platforms/android/app/src/main/AndroidManifest.xml",
    /<application/g,
    '<application android:usesCleartextTraffic="true"'
);

function replaceInFile(file, match, replace) {
    fs.readFile(file, "utf8", function (err,data) {
        if (err) return console.log(err);
        let result = data.replace(match, replace);
        fs.writeFile(file, result, "utf8", function (err) {
            if (err) return console.log(err);
        });
    });
}
