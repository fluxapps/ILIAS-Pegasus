/* DESCRIPTION: This script is used as a hook that is declared in "config.xml"
 * -> replace the folder ./resources with the icon and splash screen with the one corresponding to the chosen theme
 * -> replace the folder ./src/assets with the one corresponding to the chosen theme
 * -> generate "src/assets/config.json" with the required ILIAS installations from "branding/common/config/server.config.json"
 * -> generate language files in "src/assets/i18n" by inserting theme-specific changes to the files in "branding/common/i18n"
 *
 * USAGE: the theme can be set via the "--theme"-tag
 * ionic cordova CMD -- --theme=[BRAND_NAME]
 * with CMD = 'prepare ...', 'build ...', 'run ...' or 'emulate ...'
 */

const FS = require("fs");
let console_log = "";

module.exports = function(context) {
    let theme = "";
    try {
        theme = getTheme(context);
        replaceDirectory(`branding/brands/${theme}/resources`, "resources");
        replaceDirectory(`branding/brands/${theme}/assets`, "src/assets");
        generateConfigFile(theme);
        generateLangFiles(theme);
        generateVariablesScssFile();
    } catch (e) {
        console_log += e.stack;
        throw (e);
    } finally {
        writeLog(theme);
    }
}

// get theme from command-line or set to default
function getTheme(context) {
    let ind = context.cmdLine.indexOf("--theme");
    let theme = context.cmdLine.substring(ind + 8).split(" ")[0];

    if (ind === -1) {
        let msg = "hook(set_brand.js) WARNING: flag for setting the theme not found. ";
        msg += "use as 'ionic cordova CMD -- --theme=[BRAND_NAME]' with CMD = 'prepare ...', 'build ...', 'run ...' or 'emulate ...'";
        throw new Error(msg);
    }
    if (!FS.existsSync(`branding/brands/${theme}`)) {
        throw new Error(`hook(set_brand.js) WARNING: the directory 'branding/brands/${theme}' for the theme '${theme}' does not exist`);
    }

    consoleOut(`hook(set_brand.js) setting theme to '${theme}'. additional info in 'branding/set_brand.log' and 'branding/README.md'`);
    return theme;
}

// generate "src/assets/config.json"
function generateConfigFile(theme) {
    let config_server = loadJSON("branding/common/config/server.config.json", "utf8").installations;
    let config_brand = loadJSON(`branding/brands/${theme}/config.json`);
    let config_out = { "installations": [] };

    for (let i in config_brand.ilias_installation_ids) {
        for (let j in config_server) {
            if (config_brand.ilias_installation_ids[i] === config_server[j].id)
                config_out.installations.push(config_server[j]);
        }
    }

    if (config_out.installations.length !== config_brand.ilias_installation_ids.length) {
        let msg = `hook(set_brand.js) WARNING: unable to match all ilias installation ids in ${JSON.stringify(config_brand.ilias_installation_ids)} . `;
        msg += `this selection of ids is set in 'src/assets/${theme}/config.json' and the ilias installations are set in 'branding/common/config/server.config.json'`;
        throw new Error(msg);
    }

    writeJSON("src/assets/config.json", config_out);
}

// generate language-files from a global and a theme-specific source
function generateLangFiles(theme) {
    FS.readdirSync("branding/common/i18n").forEach(function(file) {
        let lng_tree = loadJSON(`branding/common/i18n/${file}`);
        let path_lng_mod = `branding/brands/${theme}/assets/i18n/${file}`;

        if(FS.existsSync(path_lng_mod))
            insert(loadJSON(path_lng_mod), lng_tree);

        const path = "src/assets/i18n";
        if(!FS.existsSync(path))
            FS.mkdirSync(path);
        writeJSON(`${path}/${file}`, lng_tree);
    });
}

// generate the stylesheet-file "src/theme/variables.scss"
function generateVariablesScssFile() {
    const content = `
    @import "ionic.globals";
    @import "../assets/stylesheets/theme";
    $ionicons-font-path: "../assets/fonts";
    @import "ionicons";`;

    const path = "src/theme";
    if(!FS.existsSync(path))
        FS.mkdirSync(path);
    FS.writeFileSync(`${path}/variables.scss`, content);
}

// replace directory at target with the one at source
function replaceDirectory(path_from, path_to) {
    deleteDirSync(path_to);
    FS.mkdirSync(path_to);
    copyDirSync(path_from, path_to);
}

// delete directory
function deleteDirSync(path) {
    if(FS.existsSync(path)) {
        FS.readdirSync(path).forEach(function(file) {
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
        FS.readdirSync(path_from).forEach(function(file) {
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

// insert-operation for an object-tree of strings
function insert(source, target) {
    for(let key in source) {
        if (typeof(source[key]) === "string") {
            target[key] = source[key];
        } else {
            if(!target.hasOwnProperty(key)) {
                target[key] = {};
            }
            insert(source[key], target[key]);
        }
    }
}

// load and parse a json-file
function loadJSON(file) {
    return JSON.parse(FS.readFileSync(file, "utf8"));
}

// stringify and write a json-file
function writeJSON(file, data) {
    FS.writeFileSync(file, JSON.stringify(data));
}

// write msg to console and add it to console_log
function consoleOut(msg) {
    console.log(msg);
    console_log += msg + "\n";
}

// generates a log for this hook at src/assets/branding.log
function writeLog(theme) {
    let log = `content automatically generated by the hook 'set_brand.js'

THEME ......... ${theme}
RESOURCES ..... branding/brands/${theme}/resources => resources
ASSETS ........ branding/brands/${theme}/assets => src/assets
CONFIG ........ branding/common/config/server.config.json + branding/brands/${theme}/config.json => src/assets/config.json
LANGUAGE ...... branding/common/i18n/* + branding/brands/${theme}/assets/i18n/* => src/assets/i18n/*
STYLESHEET .... src/theme/variables.scss

CONSOLE OUTPUT
${console_log}`;
    FS.writeFileSync("branding/set_brand.log", log);
}
