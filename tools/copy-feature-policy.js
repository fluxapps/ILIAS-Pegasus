const { copyFileSync, existsSync } = require("fs");
const colors = require("colors");

const envPath = "src/environments/features.json";
const vanillaPolicyPath = "branding/brands/vanilla/features.json";

console.log("Check feature policy existence ...");
if (!existsSync(envPath)) {
    copyFileSync(vanillaPolicyPath, envPath);
    console.log(colors.green("Feature policy copied from vanilla brand"))
} else {
    console.log(colors.green("Feature Policy exists"))
}
