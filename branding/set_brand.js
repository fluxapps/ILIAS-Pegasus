#!/usr/bin/env node
/* DESCRIPTION: This script sets the branding of the app, it
 * -> replaces the folder ./resources with the icon and splash screen with the one corresponding to the chosen brand
 * -> replaces the folder ./src/assets with the one corresponding to the chosen brand
 * -> creates the folder ./src/assets/scormplayer with the content of "branding/common/scormplayer"
 * -> replaces the file ./build.json used for IOS release builds
 * -> generates "src/assets/config.json" with the required ILIAS installations from "branding/common/config/server.config.json"
 * -> sets values in "config.xml" to the ones specified in "branding/brands/[brand]/config.json"
 * -> generates language files in "src/assets/i18n" by inserting brand-specific changes to the files in "branding/common/i18n"
 *
 * USAGE: the brand can be set via the "--brand"-tag, the "--platforms"-tag is optional
 * npm run setbrand -- --brand=[BRAND_NAME] --platforms==[PLATFORMS]
 */

const FS = require("fs");
const OS = require("os");
const deepmerge = require("deepmerge");
const { Validator } = require("jsonschema");

let console_log = "";
execute();

function execute() {
    let brand = "";
    let platforms = "";
    try {
        [brand, platforms] = getFlagValues();
        const config = loadJSON(`branding/brands/${brand}/config.json`);
        setDirectoryContent("resources", `branding/brands/${brand}/resources`);
        setDirectoryContent("src/assets", `branding/brands/${brand}/assets`);
        setDirectoryContent("src/assets/scormplayer", "branding/common/scormplayer");
        linkFile("build.json", `branding/brands/${brand}/build.json`);
        linkFile("src/environments/features.json", `branding/brands/${brand}/features.json`);
        generateServerConfigFile(brand, config);
        setValuesInProjectConfig(config);
        generateLangFiles(brand);
        refreshPlatforms(platforms);
    } catch(e) {
        console_log += e.stack;
        if (globalThis.process.exitCode === 0) {
            globalThis.process.exitCode = 1;
        }
    } finally {
        writeLog(brand);
    }
}

// get arguments from the command-line
function getFlagValues() {
    let brand = getFlagValueFromArgv("brand");
    if (brand === undefined) throw new Error("(set_brand.js) flag for setting the brand not found. use as 'npm run setbrand -- --brand=[BRAND_NAME]'");
    if (!FS.existsSync(`branding/brands/${brand}`))
        throw new Error(`(set_brand.js) the directory 'branding/brands/${brand}' for the brand '${brand}' does not exist`);
    consoleOut(`setting brand to '${brand}'. additional info in 'branding/set_brand.log' and 'branding/README.md'`);

    let platforms = getFlagValueFromArgv("platforms");
    switch (platforms) {
        case undefined:
            platforms = "ia";
            consoleOut(`flag 'platforms' not found, adding ios and android platforms by default`);
            break;
        case "ia":
        case "ai":
            platforms = "ia";
            consoleOut(`adding the platforms ios and android`);
            break;
        case "i":
            consoleOut(`adding the platform ios`);
            break;
        case "a":
            consoleOut(`adding the platform android`);
            break;
        case "none":
            platforms = undefined;
            consoleOut(`not adding any platforms`);
            break;
        default:
            throw new Error(`(set_brand.js) unable to interpret the flag 'platforms', set to '${platforms}'. possible values are 'ia', 'ai', 'i', 'a'`);
    }

    return [brand, platforms]
}

// get value of the argument with flag 'name' from the command-line
function getFlagValueFromArgv(name) {
    for (let i = 0; i < process.argv.length; i++) {
        let list = process.argv[i].split("=");
        if (list[0] === `--${name}`)
            return list[1];
    }

    return undefined;
}

// generate "src/assets/config.json"
function generateServerConfigFile(brand, config) {
    const jsonValidator = new Validator();
    const schema = jsonValidator.addSchema(
        loadJSON("branding/common/config/server.config.schema.json", "utf8"),
        "https://www.ilias-pegasus.de/app/draft-07/schema/server.config.schema.json"
    );
    const fullConfig = loadJSON("branding/common/config/server.config.json", "utf8");
    const result = jsonValidator.validate(fullConfig, schema, {throwError: false});

    for (const validationError of result.errors) {
        consoleError(`Validation of "branding/common/config/server.config.json" failed with message "${validationError.message}" for property "${validationError.property}".`);
    }

    if (result.errors.length > 0) {
        globalThis.process.exitCode = 1;
        throw new Error("(set_brand.js) Server config json invalid!");
    }

    const config_server = fullConfig.installations;
    const config_out = { "installations": [] };
    const installationMap = config_server.reduceRight((col, it) => col.set(it.id, it), new Map());
    const brandInstallationIds = config.ilias_installation_ids;

    const missingIds = [];
    for (let i of brandInstallationIds) {
        if (!installationMap.has(i)) {
            missingIds.push(i);
            continue;
        }

        config_out.installations.push(installationMap.get(i));
    }

    if (missingIds.length > 0) {
        let msg = `unable to match all ilias installation ids in ${JSON.stringify(brandInstallationIds)}. `;
        msg += `The following ids are missing ${JSON.stringify(missingIds)}. `;
        msg += `This selection of ids is set in 'src/assets/${brand}/config.json' and the ilias installations are set in 'branding/common/config/server.config.json'`;
        consoleError(msg);
        throw new Error(msg);
    }

    writeJSON("src/assets/config.json", config_out);
}

// set values in "config.xml"
function setValuesInProjectConfig(config) {
    // for each entry, the 'setValueInTag'-method is called until the tag was found once
    const androidId = config.projectConfig.androidId || config.projectConfig.id;
    let toDoList = [
        {tag: "<widget ", pre: "id=\"", value: config.projectConfig.id, post: "\"", done: false},
        {tag: "<widget ", pre: "android-packageName=\"", value: androidId, post: "\"", done: false},
        {tag: "<name>", pre: "<name>", value: config.projectConfig.name, post: "</name>", done: false},
        {tag: "<description>", pre: "<description>", value: config.projectConfig.description, post: "</description>", done: false}
    ];

    // iterate trough lines of 'config.xml' until all tags have ben found
    let lines = FS.readFileSync("config.xml", "utf8").split("\n");
    let done = false;
    for(let i = 0; (i < lines.length) && !done; i++) {
        done = true;
        toDoList.forEach(e => {
            [lines[i], e.done] = (e.done) ? [lines[i], e.done] : setValueInTag(lines[i], e.tag, e.pre, e.value, e.post);
            done &= e.done;
        });
    }

    if(!done) {
        let notDone = "";
        toDoList.forEach(function(e) {
            notDone += (e.done) ? "" : `${e.tag} `;
        });
        throw new Error(`(set_brand.js) unable to set the value(s) for the following tag(s) [ ${notDone}] in 'config.xml'`);
    }

    FS.writeFileSync("config.xml", lines.join("\n"));
}

// generate language-files from a global and a brand-specific source
function generateLangFiles(brand) {
    FS.readdirSync("branding/common/i18n").forEach(function(file) {
        let lng_tree = loadJSON(`branding/common/i18n/${file}`);
        let path_lng_mod = `branding/brands/${brand}/assets/i18n/${file}`;

        if (FS.existsSync(path_lng_mod)) {
            lng_tree = insert(loadJSON(path_lng_mod), lng_tree);
        }

        const path = "src/assets/i18n";
        if (!FS.existsSync(path))
            FS.mkdirSync(path);
        writeJSON(`${path}/${file}`, lng_tree);
    });
}

// remove platforms-directory and add the platforms from scratch
function refreshPlatforms(platforms) {
    if(platforms === undefined) return;
    deleteDirSync("platforms");

    if(platforms.indexOf("a") !== -1)
        runShell("npx ionic cordova platform add android");

    if(platforms.indexOf("i") !== -1)
        if (OS.platform() === "darwin") runShell("npx ionic cordova platform add ios");
        else consoleOut(`did not add ios-platform on the operating system "${OS.platform()}"`);
}

// run cmd as a shell-script
function runShell(cmd) {
    const exec = require("child_process").exec;
    exec(cmd, (err, stdout, stderr) => {
        consoleOut(`running command "${cmd}"`);
        consoleOut(`stdout ${stdout}`);
        if(err !== null) {
            consoleOut(`err ${err}`);
            consoleOut(`stderr ${stderr}`);
            throw new Error(`failed when running command "${cmd}", see the output above for details`);
        }
    });
}

// if the @line contains @tag, the content between @pre and @post is replaced with @value
function setValueInTag(line, tag, pre, value, post) {
    if (line.indexOf(tag) !== -1) {
        let ind0 = line.indexOf(pre) + pre.length;
        let ind1 = line.indexOf(post, ind0);
        line = `${line.substring(0, ind0)}${value}${line.substring(ind1)}`;
        return [line, true];
    }
    return [line, false];
}

// set file at target to the one at source
function linkFile(path_to, path_from) {
    unlinkFile(path_to);
    FS.linkSync(path_from, path_to);
}

// set file at target to the one at source
function unlinkFile(path) {
    if (FS.existsSync(path)) {
        FS.unlinkSync(path);
    }
}

// set directory at target to the one at source
function setDirectoryContent(path_to, path_from) {
    if(!FS.existsSync(path_from))
        throw new Error(`(set_brand.js) the directory '${path_from}' for '${path_to}' does not exist`);
    deleteDirSync(path_to);
    FS.mkdirSync(path_to);
    copyDirSync(path_from, path_to);
}

// delete directory
function deleteDirSync(path) {
    if (FS.existsSync(path)) {
        FS.rmdirSync(path, {recursive: true, maxRetries: 3});
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
                linkFile(itemPath_to, itemPath_from);
            }
        });
    }
}

// insert-operation for an object-tree of strings
function insert(source, target) {
    return deepmerge.all([target, source]);
}

// load and parse a json-file
function loadJSON(file) {
    return JSON.parse(FS.readFileSync(file, "utf8"));
}

// stringify and write a json-file
function writeJSON(file, data) {
    // We have to unlink the file first in case the file is hard linked.
    unlinkFile(file);
    FS.writeFileSync(file, JSON.stringify(data));
}

// write msg to console and add it to console_log
function consoleOut(msg) {
    const message = `(set_brand.js) ${msg}`;
    console.info(message);
    console_log += `${message}\n`;
}

// write msg to stderr and add it to console_log
function consoleError(msg) {
    const message = `(set_brand.js) ${msg}`;
    console.error(message);
    console_log += `${message}\n`;
}

// generates a log for this script at src/assets/branding.log
function writeLog(brand) {
    let log = `content automatically generated by the script './branding/set_brand.js'

BRAND ........... ${brand}
RESOURCES ....... branding/brands/${brand}/resources => resources
ASSETS .......... branding/brands/${brand}/assets => src/assets
SCORMPLAYER ..... branding/common/scormplayer => src/assets/scormplayer
SERVERCONFIG .... branding/common/config/server.config.json + branding/brands/${brand}/config.json => src/assets/config.json
PROJECTCONFIG ... config.xml + branding/brands/${brand}/config.json => config.xml
LANGUAGE ........ branding/common/i18n/* + branding/brands/${brand}/assets/i18n/* => src/assets/i18n/*
BUILD ........... branding/brands/${brand}/build.json => build.json

PLATFORM ........ ${process.platform}
NODEJS .......... ${process.versions.node}
V8 .............. ${process.versions.v8}

CONSOLE OUTPUT
${console_log}`;
    FS.writeFileSync("branding/set_brand.log", log);
}
