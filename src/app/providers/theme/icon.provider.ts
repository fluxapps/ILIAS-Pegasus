import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {Injectable} from "@angular/core";
import {File} from "@ionic-native/file/ngx";
import {WebView} from "@ionic-native/ionic-webview/ngx";
import {Settings} from "../../models/settings";
import {AuthenticationProvider} from "../authentication.provider";
import {CssStyleService} from "../../services/theme/css-style.service";
import {ThemeSynchronizationService} from "../../services/theme/theme-synchronization.service";
import {FileStorageService} from "../../services/filesystem/file-storage.service";

@Injectable({
    providedIn: "root"
})
export class IconProvider {
    private static src: Array<string | SafeResourceUrl> = [];
    private static defaultIconKey: string = "link";
    private icons: Array<{key: string, loadedName: string, asset: string}> = [
        {key: "crs", loadedName: "course.svg", asset: "assets/icon/obj_course.svg"},
        {key: "fold", loadedName: "folder.svg", asset: "assets/icon/obj_folder.svg"},
        {key: "grp", loadedName: "group.svg", asset: "assets/icon/obj_group.svg"},
        {key: "file", loadedName: "file.svg", asset: "assets/icon/obj_file.svg"},
        {key: "xsrl", loadedName: "learningplace.svg", asset: "assets/icon/obj_location.svg"},
        {key: "htlm", loadedName: "learningmodule.svg", asset: "assets/icon/obj_learningmodule.svg"},
        {key: "sahs", loadedName: "learningmodule.svg", asset: "assets/icon/obj_learningmodule.svg"},
        {key: "link", loadedName: "link.svg", asset: "assets/icon/obj_link.svg"},
    ];

    constructor(
        private readonly fileStorage: FileStorageService,
        private readonly filesystem: File,
        private readonly webview: WebView,
        private readonly sanitizer: DomSanitizer
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
        if(CssStyleService.dynamicThemeEnabled() && await ThemeSynchronizationService.dynamicThemeAvailable()) {
            const path: string = await this.fileStorage.dirForUser("icons");
            for(let i: number = 0; i < this.icons.length; i++) {
                const icon: {key: string, loadedName: string, asset: string} = this.icons[i];
                const settings: Settings = await AuthenticationProvider.getUser().settings;
                const fileName: string = `${settings.themeTimestamp}_${icon.loadedName}`;
                let src: string;
                let safeURL: SafeResourceUrl
                try {
                    src = (await this.filesystem.resolveLocalFilesystemUrl(`${path}${fileName}`)).toURL();
                    console.log(`safe url is: ${safeURL}`)
                    console.log("normal url is" , src)
                    src = this.webview.convertFileSrc(src);
                    safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(src)

                } catch (e) {
                    // if the custom icon is not available, use the default one
                    src = this.icons[i].asset;
                    console.warn(`unable to load custom icon ${fileName} in ${path}, resulted in error ${e.message}`);
                }
                IconProvider.src[icon.key] = safeURL;
            }
        } else {
            for(let i: number = 0; i < this.icons.length; i++) {
                IconProvider.src[this.icons[i].key] = this.icons[i].asset;
            }
        }
    }
}
