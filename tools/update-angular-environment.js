const { writeFile } = require("fs");
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config();

const requiredEnv = [
    "MAPBOX_API_KEY",
    "PRODUCTION",
];

function checkEnvVariables() {
    const missingEnv = requiredEnv.filter((entry) => process.env[entry] === undefined);
    if (missingEnv.length > 0) {
        console.error(colors.red("The following env variables are missing:"));
        missingEnv.forEach((it) => console.error(colors.red(it)));
        console.info(colors.blue("Env variables can be set project wide with a .env file. (Example file .env.example)"));
        throw new Error();
    }
}

function env(name, defaultValue) {
    if (typeof process.env[name] !== "string" && typeof process.env[name] !== "number") {
        return defaultValue;
    }

    return process.env[name];
}

function writeAngularEnvFile() {
    // Configure Angular `environment.ts` file path
    const targetPath = "./src/environments/environment.ts";
    const mapboxApiKey = env("MAPBOX_API_KEY", "NO_API_KEY_SPECIFIED");
    const isProductionBuild = env("PRODUCTION", "false").toString().toLowerCase() === "true";

// `environment.ts` file structure
    const envConfigFile = `
interface AppEnvironment {
    readonly mapboxApiKey: string;
    readonly production: boolean;
}
export const environment: AppEnvironment = {
    mapboxApiKey: "${mapboxApiKey}",
    production: ${isProductionBuild}
};
`;
    console.log(colors.magenta("The file `environment.ts` will be written with the following content: \n"));
    console.log(colors.grey(envConfigFile.replace(mapboxApiKey, "<TOKEN>")));
    writeFile(targetPath, envConfigFile, (err) => {
        if (err) {
            console.error(err);
            throw err;
        } else {
            console.log(colors.magenta(`Angular environment.ts file generated at ${targetPath} \n`));
        }
    });
}

checkEnvVariables();
writeAngularEnvFile();
