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
 * npm run setbrand -- --brand [BRAND_NAME] --platforms [PLATFORMS]
 */

const FS = require("fs");
const OS = require("os");
const path = require("path");
const deepmerge = require("deepmerge");
const { Validator } = require("jsonschema");
const { ConfigParser } = require("cordova-common");
const {xml2js, js2xml} = require("xml-js");
const {Command, Option} = require("commander");

let console_log = "";

function execute(options, command) {
    const {brand, platforms} = options;

    try {
        const config = loadJSON(`branding/brands/${brand}/config.json`);
        cleanUpOldConfigXmlStaticResourceEntries();
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
        throw e;
    } finally {
        writeLog(brand);
    }
}

function run() {
    const command = new Command();
    return command
        .name("setbrand")
        .version(getPackageVersion(), "-v, --version", "Prints the set brand cli version")
        .usage("-- [options]")
        .addOption(new Option("-b, --brand [brand]", "The brand which should get installed.")
            .choices(getAvailableBrands())
            .makeOptionMandatory(true)
        )
        .addOption(new Option("-p, --platforms [platforms]", "The platforms which should get added, valid options are 'a' (Android) and 'i' (iOS).")
            .default("ai")
            .choices(["a", "i", "ai", "ia", "none"])
        )
        .showHelpAfterError(true)
        .showSuggestionAfterError(true)
        .allowExcessArguments(false)
        .allowUnknownOption(false)
        .action(execute)
        .parse(process.argv);
}

function getAvailableBrands() {
    const brandBasePath = path.join(process.cwd(), "branding", "brands");
    return FS.readdirSync(brandBasePath, {encoding: "utf8", withFileTypes: false})
        .filter((it) => !it.startsWith('.'));
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

function getPackageVersion() {
    const project = loadJSON("package.json");
    return project.version;
}

// set values in "config.xml"
function setValuesInProjectConfig(config) {

    const cordovaConf = new ConfigParser("config.xml");


    // for each entry, the 'setValueInTag'-method is called until the tag was found once
    const androidId = config.projectConfig.androidId || config.projectConfig.id;

    /**
     * @type string
     */
    let name = config.projectConfig.name;
    name = name.replace(' ', '-');

    cordovaConf.setPackageName(config.projectConfig.id);
    cordovaConf.doc.getroot().attrib["android-packageName"] = androidId;
    cordovaConf.setGlobalPreference("AppendUserAgent", `${name}/${getPackageVersion()}`);
    cordovaConf.setName(config.projectConfig.name);
    cordovaConf.setDescription(config.projectConfig.description);
    cordovaConf.write();
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

function cleanUpOldConfigXmlStaticResourceEntries() {
    const xml = FS.readFileSync("config.xml", "utf8");
    const tree = xml2js(xml, {compact: true, spaces: 4});
    const platforms = tree.widget.platform;
    delete tree.widget.icon;
    delete tree.widget.splash;
    for(const platform of platforms) {
        delete platform.splash;
        delete platform.icon;
    }
    FS.writeFileSync("config.xml", js2xml(tree, {compact: true, spaces: 4}), "utf8");
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

run();
