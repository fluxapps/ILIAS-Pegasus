/**
 * avoids exceptions during compilation when node-modules require packages in a deprecated manner
 * the modules should be updated by their maintainers to support the new standard
 */

const fs = require("fs");

replaceInFile(
    "node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js",
    /node: false/g,
    "node: { crypto: true, stream: true, fs: 'empty', net: 'empty', tls: 'empty', dns: 'empty', hiredis: 'empty', dgram: 'empty', 'child_process' : 'empty', 'pg-native' : 'empty', '../package' : 'empty' }"
);

replaceInFile(
    "node_modules/node-pre-gyp/lib/node-pre-gyp.js",
    /proto.package = require\('\.\.\/package'\)/g,
    "proto.package = null"
);

replaceInFile(
    "node_modules/pg/lib/native/client.js",
    /var Native = require\('pg-native'\)/g,
    "var Native = null"
);

function replaceInFile(file, match, replace) {
    fs.readFile(file, "utf8", function (err,data) {
        if (err) return console.log(err);
        let result = data.replace(match, replace);
        fs.writeFile(file, result, "utf8", function (err) {
            if (err) return console.log(err);
        });
    });
}
