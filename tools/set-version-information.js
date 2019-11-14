const package = require("../package.json");
const { writeFileSync, readFileSync } = require("fs");
const colors = require("colors");
const { js2xml, xml2js } = require("xml-js");

const BUILD_NUMBER_PATTERN = /^\d+(\.\d+){0,2}$/.compile();

function fetchBuildNumber() {
    // try to get build number from ci pipeline
    let buildNumber = process.env.BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || process.env.APPVEYOR_BUILD_NUMBER || process.env.CIRCLE_BUILD_NUM || process.env.BUILD_BUILDNUMBER;
    if (typeof buildNumber === "string" && buildNumber.length > 0) {
        // Check that the apple version constraint is satisfied. The build would get rejected otherwise.
        if (!BUILD_NUMBER_PATTERN.test(buildNumber)) {
            const message = "Invalid build number pattern: Must be a period separated list of at most three non-negative integers.";
            console.log(colors.red(message));
            throw Error(message);
        }

        return buildNumber;
    }

    // we are not building on ci generate local build number
    const today = new Date();
    const dd = (today.getDate() < 10 ? `0${today.getDate()}` : today.getDate().toString());
    // January is 0!
    const mm = ((today.getMonth() + 1) < 10 ? `0${today.getMonth() + 1}` : (today.getMonth() + 1).toString());
    const yyyy = today.getFullYear();

    // Ref number at the end is always 1 because there is no way to get the build count on a local machine.
    buildNumber = `${yyyy}${mm}${dd}.1`;
    return buildNumber;
}

function generateAndroidVersionCode() {
    let revision = fetchBuildNumber().replace(/^.*?\./, "");
    if (revision.length > 2) {
        revision = "99";
    }

    if (revision.length < 2) {
        revision = `0${revision}`;
    }

    // we are not building on ci generate local build number
    const today = new Date();
    const dd = (today.getDate() < 10 ? `0${today.getDate()}` : today.getDate().toString());
    // January is 0!
    const mm = ((today.getMonth() + 1) < 10 ? `0${today.getMonth() + 1}` : (today.getMonth() + 1).toString());
    const yyyy = today.getFullYear();
    return `${yyyy}${mm}${dd}${revision}`;
}

async function setAppVersions() {
    // increment the version for cordova
    const cordovaConfig = "config.xml";
    const configJson = xml2js(readFileSync(cordovaConfig).toString());
    configJson.elements[0].attributes["version"] = package.version;
    console.log(colors.blue(`Set App version to ${package.version}`));

    const buildNumber = fetchBuildNumber();
    const androidVersionCode = generateAndroidVersionCode();
    configJson.elements[0].attributes["ios-CFBundleVersion"] = buildNumber;
    console.log(colors.blue(`Set iOS build version to ${buildNumber}`));
    configJson.elements[0].attributes["android-versionCode"] = androidVersionCode;
    console.log(colors.blue(`Set Android version code to ${androidVersionCode}`));

    const configXml = js2xml(configJson, { compact: false, spaces: 4 });
    writeFileSync(cordovaConfig, configXml);
}

setAppVersions();

