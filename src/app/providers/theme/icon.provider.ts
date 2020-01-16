import {Injectable} from "@angular/core";
import {LocalStorageService} from "../../services/local-storage.service";
import {File} from "@ionic-native/file/ngx";
import {WebView} from "@ionic-native/ionic-webview/ngx";
import {Settings} from "../../models/settings";
import {AuthenticationProvider} from "../authentication.provider";
import {CssStyleService} from "../../services/theme/css-style.service";

@Injectable({
    providedIn: "root"
})
export class IconProvider {
    private static src: Array<string> = [];
    private static defaultIconKey: string = "link";
    private icons: Array<{key: string, loadedName: string, asset: string}> = [
        {key: "crs", loadedName: "course.svg", asset: "assets/icon/obj_course.svg"},
        {key: "fold", loadedName: "folder.svg", asset: "assets/icon/obj_folder.svg"},
        {key: "grp", loadedName: "group.svg", asset: "assets/icon/obj_group.svg"},
        {key: "file", loadedName: "file.svg", asset: "assets/icon/obj_file.svg"},
        {key: "xsrl", loadedName: "learningplace.svg", asset: "assets/icon/obj_location.svg"},
        {key: "link", loadedName: "link.svg", asset: "assets/icon/obj_link.svg"},
    ];

    constructor(
        private readonly localStorage: LocalStorageService,
        private readonly filesystem: File,
        private readonly webview: WebView,
    ) {}

    static getIconSrc(key: string): string {
        if(!(IconProvider.defaultIconKey in IconProvider.src)) {
            console.warn(`getIconSrc("${key}") of IconProvider called but the default key "${IconProvider.defaultIconKey}" is not set, returning undefined`);
            return undefined;
        }

        if(IconProvider.src[key])
            return IconProvider.src[key];
        return IconProvider.src[IconProvider.defaultIconKey];
    }

    async loadResources(): Promise<void> {
        if(CssStyleService.dynamicThemeEnabled()) {
            const path: string = await this.localStorage.dirForInstallationAndUser("icons");
            for(let i: number = 0; i < this.icons.length; i++) {
                const icon: {key: string, loadedName: string, asset: string} = this.icons[i];
                const settings: Settings = await AuthenticationProvider.getUser().settings;
                const fileName: string = `${settings.themeTimestamp}_${icon.loadedName}`;
                const src: string = (await this.filesystem.resolveLocalFilesystemUrl(`${path}${fileName}`)).toURL();
                IconProvider.src[icon.key] = this.webview.convertFileSrc(src);
            }
        } else {
            for(let i: number = 0; i < this.icons.length; i++) {
                IconProvider.src[this.icons[i].key] = this.icons[i].asset;
            }
        }
    }
}
