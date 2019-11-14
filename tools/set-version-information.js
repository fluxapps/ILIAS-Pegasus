const package = require("../package.json");
const os = require("os");
const { exec } = require("child_process");
const path = require("path");
const { existsSync } = require("fs");
const colors = require("colors");

const IOS_PLATFORM_PATH = path.join(process.cwd(), "platforms", "ios");
const ANDROID_PLATFORM_PATH = path.join(process.cwd(), "platforms", "android");

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


async function startAndAwaitProcess(command, cwd) {
    return new Promise((resolve, reject) => {
        const proc = exec(command, {
            cwd
        });
        const resolveHandler = (exitCode, signal) => resolve({exitCode, signal});
        proc.once("exit", resolveHandler);
        proc.once("error", (error) => {
            proc.off("exit", resolveHandler);
            console.error(colors.red(`Command "${command}" failed.`), error);
            reject(error);
        });
    });
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
    if (os.platform() === "darwin" && existsSync(IOS_PLATFORM_PATH)) {
        await startAndAwaitProcess(`xcrun agvtool new-marketing-version ${package.version}`, IOS_PLATFORM_PATH);
        console.log(colors.blue(`Set iOS short version to ${package.version}`));

        const buildNumber = fetchBuildNumber();
        await startAndAwaitProcess(`xcrun agvtool new-version ${buildNumber}`, IOS_PLATFORM_PATH);
        console.log(colors.blue(`Set iOS build version to ${buildNumber}`));
    }

    if (existsSync(ANDROID_PLATFORM_PATH)) {
        // Set version code for android builds
        const androidVersionCode = generateAndroidVersionCode();
        process.env["ORG_GRADLE_PROJECT_cdvVersionCode"] = androidVersionCode;
        console.log(colors.blue(`Set Android version code to ${androidVersionCode}`));
        process.env["ORG_GRADLE_PROJECT_cdvVersionName"] = package.version;
        console.log(colors.blue(`Set Android version name to ${package.version}`));
    }
}

setAppVersions();

