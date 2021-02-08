const { EEXIST } = require("constants");
const fs = require("fs");
const path = require('path');

symLink(
    path.join(process.cwd(), "branding", "brands", "vanilla", "assets"),
    path.join(process.cwd(), "src", "assets")
);

function symLink(PATH_TO, PATH_FROM) {
    try {
        fs.symlinkSync(PATH_TO, PATH_FROM);

        if (fs.existsSync(PATH_TO)) {
            console.info("Set symlink to assets folder");
            return;
        } else {
            console.error(`Couldn't set a symlink to the assets folder: ${PATH_TO}`);
            return;
        }
    } catch (err) {
        if (err.errno !== EEXIST) {
            console.error(`"Error during symlink from ${PATH_FROM} to ${PATH_TO}`)
            throw err;
        }
        else
            console.info("Symlink to assets folder already exists");
    }
}
