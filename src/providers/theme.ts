import {Injectable} from "@angular/core";

// Each theme declares an "assets_dir" in "src/assets", where all theme-related files are located.
interface ThemeObject {
    assets_dir: string;
}

@Injectable()
export class ThemeProvider {
    private static staticInstance: ThemeProvider = undefined;
    // NOTE: The script "./set_theme.js" searches for "@HOOK ..." and replaces the line thereafter to set the theme
    // You may need to also edit "./set_theme.js" when changing this line
    // @HOOK selectedTheme
    private static readonly theme: ThemeObject = { assets_dir: "vanilla" };

    static instance(): ThemeProvider {
        if (ThemeProvider.staticInstance == undefined)
            ThemeProvider.staticInstance = new ThemeProvider();
        return ThemeProvider.staticInstance;
    }

    getAsset(file: string): string {
        return `assets/${ThemeProvider.theme.assets_dir}/${file}`;
    }
}
