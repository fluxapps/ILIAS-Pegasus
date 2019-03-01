/* DESCRIPTION: This script sets the branding of the app, it
 * -> replaces the folder ./resources with the icon and splash screen with the one corresponding to the chosen brand
 * -> replaces the folder ./src/assets with the one corresponding to the chosen brand
 * -> replaces the file ./build.json used for IOS release builds
 * -> generates "src/assets/config.json" with the required ILIAS installations from "branding/common/config/server.config.json"
 * -> generates language files in "src/assets/i18n" by inserting brand-specific changes to the files in "branding/common/i18n"
 *
 * USAGE: the brand can be set via the "--brand"-tag
 * npm run setbrand -- --brand=[BRAND_NAME]
 */

const FS = require("fs");
let console_log = "";
execute();

function execute() {
    let brand = "";
    try {
        brand = getBrand();
        setDirectoryContent("resources", `branding/brands/${brand}/resources`);
        setDirectoryContent("src/assets", `branding/brands/${brand}/assets`);
        setFile("build.json", `branding/brands/${brand}/build.json`);
        generateConfigFile(brand);
        generateLangFiles(brand);
        consoleOut("(set_brand.js) DONE");
    } catch(e) {
        console_log += e.stack;
        throw(e);
    } finally {
        writeLog(brand);
    }
}

// get brand from command-line
function getBrand() {
    // find and check the "--brand"-tag
    for (let i = 0; i < process.argv.length; i++) {
        let list = process.argv[i].split('=');
        if (list[0] === "--brand") {
            let brand = list[1];
            if (!FS.existsSync(`branding/brands/${brand}`))
                throw new Error(`(set_brand.js) the directory 'branding/brands/${brand}' for the brand '${brand}' does not exist`);
            consoleOut(`(set_brand.js) setting brand to '${brand}'. additional info in 'branding/set_brand.log' and 'branding/README.md'`);
            return brand;
        }
    }

    // if the tag does not exist, throw an error
    throw new Error("(set_brand.js) flag for setting the brand not found. use as 'npm run setbrand -- --brand=[BRAND_NAME]'");
}

// generate "src/assets/config.json"
function generateConfigFile(brand) {
    let config_server = loadJSON("branding/common/config/server.config.json", "utf8").installations;
    let config_brand = loadJSON(`branding/brands/${brand}/config.json`);
    let config_out = { "installations": [] };

    for (let i in config_brand.ilias_installation_ids) {
        for (let j in config_server) {
            if (config_brand.ilias_installation_ids[i] === config_server[j].id)
                config_out.installations.push(config_server[j]);
        }
    }

    if (config_out.installations.length !== config_brand.ilias_installation_ids.length) {
        let msg = `(set_brand.js) unable to match all ilias installation ids in ${JSON.stringify(config_brand.ilias_installation_ids)} . `;
        msg += `this selection of ids is set in 'src/assets/${brand}/config.json' and the ilias installations are set in 'branding/common/config/server.config.json'`;
        throw new Error(msg);
    }

    writeJSON("src/assets/config.json", config_out);
}

// generate language-files from a global and a brand-specific source
function generateLangFiles(brand) {
    FS.readdirSync("branding/common/i18n").forEach(function(file) {
        let lng_tree = loadJSON(`branding/common/i18n/${file}`);
        let path_lng_mod = `branding/brands/${brand}/assets/i18n/${file}`;

        if (FS.existsSync(path_lng_mod))
            insert(loadJSON(path_lng_mod), lng_tree);

        const path = "src/assets/i18n";
        if (!FS.existsSync(path))
            FS.mkdirSync(path);
        writeJSON(`${path}/${file}`, lng_tree);
    });
}

// set file at target to the one at source
function setFile(path_to, path_from) {
    FS.writeFileSync(path_to, FS.readFileSync(path_from));
}

// set directory at target to the one at source
function setDirectoryContent(path_to, path_from) {
    deleteDirSync(path_to);
    FS.mkdirSync(path_to);
    copyDirSync(path_from, path_to);
}

// delete directory
function deleteDirSync(path) {
    if (FS.existsSync(path)) {
        FS.readdirSync(path).forEach(function(file) {
            let itemPath = path + "/" + file;
            if (FS.lstatSync(itemPath).isDirectory())
                deleteDirSync(itemPath);
            else
                FS.unlinkSync(itemPath);
        });
        FS.rmdirSync(path);
    }
}

// copy directory
function copyDirSync(path_from, path_to) {
    if (FS.existsSync(path_from)) {
        FS.readdirSync(path_from).forEach(function(file) {
            let itemPath_from = path_from + "/" + file;
            let itemPath_to = path_to + "/" + file;
            if (FS.lstatSync(itemPath_from).isDirectory()) {
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
            if (!target.hasOwnProperty(key)) {
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

// generates a log for this script at src/assets/branding.log
function writeLog(brand) {
    let log = `content automatically generated by the script './branding/set_brand.js'

BRAND ......... ${brand}
RESOURCES ..... branding/brands/${brand}/resources => resources
ASSETS ........ branding/brands/${brand}/assets => src/assets
CONFIG ........ branding/common/config/server.config.json + branding/brands/${brand}/config.json => src/assets/config.json
LANGUAGE ...... branding/common/i18n/* + branding/brands/${brand}/assets/i18n/* => src/assets/i18n/*
BUILD ......... branding/brands/${brand}/build.json => build.json

CONSOLE OUTPUT
${console_log}`;
    FS.writeFileSync("branding/set_brand.log", log);
}
