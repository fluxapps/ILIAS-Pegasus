/* DESCRIPTION: This script is used as a hook that is declared in "config.xml"
 * -> generate "src/assets/config.json" with the required ILIAS installations from "config/server.config.json"
 * -> overwrite a line in "src/theme/variables.scss" and one in "src/providers/theme.ts" in order to set the
 *    theme of the app
 * -> replace the folder ./resources with the icon and splash screen with the one corresponding
 *    to the chosen theme
 *
 * USAGE: the theme can be set via the "--theme"-tag of the "cordova"-command.
 * example: "ionic cordova run android -lcs -- --theme=vanilla"
 *
 * DEFAULT: the default theme when "--theme" is not set is "vanilla"
 */

const FS = require("fs");

module.exports = function(context) {
    let theme = getTheme(context);
    generateConfigFile(theme);
    setLinesInScripts(theme);
    replaceResources(theme);
}

// get theme from command-line or set to default
function getTheme(context) {
    let ind = context.cmdLine.indexOf("--theme");
    let theme = context.cmdLine.substring(ind+8).split(" ")[0];

    if (ind === -1) {
        console.warn("hook(set_theme.js) WARNING: flag for setting the theme not found, example usage is 'ionic cordova run android -lcs -- --theme=vanilla'");
        theme = "vanilla";
    }
    if (!FS.existsSync(`src/assets/${theme}`)) {
        console.warn(`hook(set_theme.js) WARNING: the directory 'src/assets/${theme}' for the theme '${theme}' does not exist`);
        theme = "vanilla";
    }

    console.log("hook(set_theme.js) setting theme to " + theme);
    return theme;
}

// generate "src/assets/config.json"
function generateConfigFile(theme) {
    let config_server = JSON.parse(FS.readFileSync("config/server.config.json", "utf8")).installations;
    let config_brand = JSON.parse(FS.readFileSync(`src/assets/${theme}/config.json`, "utf8"));
    let config_out = { "installations": [] };

    for (let i in config_brand.ilais_installation_ids) {
        for (let j in config_server) {
            if (config_brand.ilais_installation_ids[i] === config_server[j].id)
                config_out.installations.push(config_server[j]);
        }
    }

    if (config_out.installations.length !== config_brand.ilais_installation_ids.length) {
        let msg = `hook(set_theme.js) WARNING: unable to match all ilias installation ids in ${JSON.stringify(config_brand.ilais_installation_ids)} . `;
        msg += `this selection of ids is set in 'src/assets/${theme}/config.json' and the ilias installations are set in 'config/server.config.json'`;
        console.warn(msg);
    }

    FS.writeFileSync("src/assets/config.json", JSON.stringify(config_out));
}

// set lines in scripts
function setLinesInScripts(theme) {
    setLine("src/theme/variables.scss", "@HOOK import_theme", `@import "../assets/${theme}/stylesheets/theme";`);
    setLine("src/providers/theme.ts", "@HOOK selectedTheme", `    private readonly theme: ThemeObject = { assets_dir: "${theme}" };`);
}

// replace folder with resources
function replaceResources(theme) {
    deleteDirSync("resources");
    FS.mkdirSync("resources");
    copyDirSync(`src/assets/${theme}/resources`, "resources");
}

// open the file at file_path, search for the marker-string and replace the line thereafter with new_line
function setLine(file_path, marker, new_line) {
    let lines = FS.readFileSync(file_path,"utf8").split("\n");
    for(var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(marker) !== -1) {
            lines[i+1] = new_line;
            FS.writeFileSync(file_path, lines.join("\n"));
            return;
        }
    }

    console.warn(`hook(set_theme.js) WARNING: unable to find marker "${marker}" in file ${file_path}`);
}

// delete directory
function deleteDirSync(path) {
    if(FS.existsSync(path)) {
        FS.readdirSync(path).forEach(function(file){
            let itemPath = path + "/" + file;
            if(FS.lstatSync(itemPath).isDirectory())
                deleteDirSync(itemPath);
            else
                FS.unlinkSync(itemPath);
        });
        FS.rmdirSync(path);
    }
}

// copy directory
function copyDirSync(path_from, path_to) {
    if(FS.existsSync(path_from)) {
        FS.readdirSync(path_from).forEach(function(file){
            let itemPath_from = path_from + "/" + file;
            let itemPath_to = path_to + "/" + file;
            if(FS.lstatSync(itemPath_from).isDirectory()) {
                FS.mkdirSync(itemPath_to);
                copyDirSync(itemPath_from, itemPath_to);
            } else {
                FS.writeFileSync(itemPath_to, FS.readFileSync(itemPath_from));
            }
        });
    }
}
