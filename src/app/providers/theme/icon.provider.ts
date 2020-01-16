import {Injectable} from "@angular/core";
import {LocalStorageService} from "../../services/local-storage.service";
import {File} from "@ionic-native/file/ngx";
import {WebView} from "@ionic-native/ionic-webview/ngx";
import {Settings} from "../../models/settings";
import {AuthenticationProvider} from "../authentication.provider";

@Injectable({
    providedIn: "root"
})
export class IconProvider {
    private static src: Array<string> = [];
    private static defaultIconKey: string = "link";
    private icons: Array<{key: string, file: string}> = [
        {key: "crs", file: "course.svg"},
        {key: "fold", file: "folder.svg"},
        {key: "grp", file: "group.svg"},
        {key: "file", file: "file.svg"},
        {key: "xsrl", file: "learningplace.svg"},
        {key: "link", file: "link.svg"}
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
        const path: string = await this.localStorage.dirForInstallationAndUser("icons");
        for(let i: number = 0; i < this.icons.length; i++) {
            const icon: {key: string; file: string} = this.icons[i];
            const settings: Settings = await AuthenticationProvider.getUser().settings;
            const fileName: string = `${settings.themeTimestamp}_${icon.file}`;
            const src: string = (await this.filesystem.resolveLocalFilesystemUrl(`${path}${fileName}`)).toURL();
            IconProvider.src[icon.key] = this.webview.convertFileSrc(src);
        }
    }
}
