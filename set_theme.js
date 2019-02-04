/* DESCRIPTION: This script is used as a hook that is declared in 'config.xml'
 * It overwrites a line in 'src/theme/variables.scss' and one in 'src/providers/theme.ts'
 * in order to set the theme of the app. It also replaces the folder ./resources with the
 * icon and splash screen with the one corresponding to the chosen theme
 *
 * USAGE: the theme can be set via the '--theme'-tag of the 'cordova'-command.
 * example: 'ionic cordova run android -lcs -- --theme=vanilla'
 *
 * DEFAULT: the default theme when '--theme' is not set is 'vanilla'
 */

module.exports = function(context) {
    // get the theme
    let ind = context.cmdLine.indexOf('--theme');
    let theme = context.cmdLine.substring(ind+8).split(" ")[0];
    if (ind == -1) {
        theme = 'vanilla';
        console.log("hook(set_theme.js) flag for setting the theme not found, example usage is 'ionic cordova run android -lcs -- --theme=urversity'");
    }

    console.log('hook(set_theme.js) setting theme to ' + theme);

    // set lines in scripts
    setLine('src/theme/variables.scss', '@HOOK import_theme', `@import "../assets/${theme}/stylesheets/theme";`);
    setLine('src/providers/theme.ts', '@HOOK selectedTheme', `    private readonly selectedTheme: string = "${theme}";`);

    // replace folder with resources
    let copydir = require("copy-dir");
    copydir.sync(`src/assets/${theme}/resources`, "resources");
}

// open the file at file_path, search for the marker-string and replace the line thereafter with new_line
function setLine(file_path, marker, new_line) {
    const fs = require('fs');
    let lines = fs.readFileSync(file_path,'utf8').split("\n");
    for(var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(marker) !== -1) {
            lines[i+1] = new_line;
            fs.writeFileSync(file_path, lines.join("\n"));
            return;
        }
    }

    console.log(`hook(set_theme.js) WARNING: unable to find marker "${marker}" in file ${file_path}`);
}
