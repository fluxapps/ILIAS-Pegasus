import {Injectable} from "@angular/core";

// Each theme declares an 'assets_folder' in 'src/assets', where all theme-related files are located,
// and an 'ilias_id', in correspondence to 'src/assets/config.json'. Set ilias_id=undefined in order to
// allow the free choice of a server
interface ThemeObject {
    assets_folder: string;
    ilias_id: number;
}

// List of themes, the key-string defines the value for the '--theme'-flag
const themes: { [key: string]: ThemeObject; } = {
    "vanilla": {assets_folder: "vanilla", ilias_id: undefined},
    "urversity": {assets_folder: "urversity", ilias_id: 9}
};

@Injectable()
export class ThemeProvider {
    private static staticInstance: ThemeProvider = undefined;
    // NOTE: The script './set_theme.js' searches for '@HOOK ...' and replaces the line thereafter to set the theme
    // You may need to also edit './set_theme.js' when changing this line
    // @HOOK selectedTheme
    private readonly selectedTheme: string = "urversity";

    static instance(): ThemeProvider {
        if (ThemeProvider.staticInstance == undefined)
            ThemeProvider.staticInstance = new ThemeProvider();
        return ThemeProvider.staticInstance;
    }

    getAsset(file: string): string {
        return `assets/${themes[this.selectedTheme].assets_folder}/${file}`;
    }

    getILIASInstallationId(): number {
        return themes[this.selectedTheme].ilias_id;
    }
}
