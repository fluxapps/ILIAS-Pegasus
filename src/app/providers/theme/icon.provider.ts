import { DomSanitizer, SafeResourceUrl, SafeUrl } from "@angular/platform-browser";
import {Injectable} from "@angular/core";
import {File} from "@ionic-native/file/ngx";
import {WebView} from "@ionic-native/ionic-webview/ngx";
import {Settings} from "../../models/settings";
import { Logger } from "../../services/logging/logging.api";
import { Logging } from "../../services/logging/logging.service";
import {AuthenticationProvider} from "../authentication.provider";
import {CssStyleService} from "../../services/theme/css-style.service";
import {ThemeSynchronizationService} from "../../services/theme/theme-synchronization.service";
import {FileStorageService} from "../../services/filesystem/file-storage.service";

@Injectable({
    providedIn: "root"
})
export class IconProvider {
    private static readonly defaultIconKey: string = "link";
    private static readonly src: Map<string, string | SafeResourceUrl> = new Map<string, string | SafeResourceUrl>();
    private static readonly log: Logger = Logging.getLogger("IconProvider");

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

    static getIconSrc(key: string): string | SafeUrl {
        if(!IconProvider.src.has(IconProvider.defaultIconKey)) {
            IconProvider.log.warn(() => `getIconSrc("${key}") of IconProvider called but the default key "${IconProvider.defaultIconKey}" is not set, returning undefined`);
            return undefined;
        }

        if(IconProvider.src.has(key)) {
            return IconProvider.src.get(key);
        }

        return IconProvider.src.get(IconProvider.defaultIconKey);
    }

    async loadResources(): Promise<void> {
        if(CssStyleService.dynamicThemeEnabled() && await ThemeSynchronizationService.dynamicThemeAvailable()) {
            const path: string = await this.fileStorage.dirForUser("icons");
            for(let i: number = 0; i < this.icons.length; i++) {
                const icon: {key: string, loadedName: string, asset: string} = this.icons[i];
                const settings: Settings = await AuthenticationProvider.getUser().settings;
                const fileName: string = `${settings.themeTimestamp}_${icon.loadedName}`;
                let src: string | SafeResourceUrl;
                try {
                    let fileSrc: string = (await this.filesystem.resolveLocalFilesystemUrl(`${path}${fileName}`)).toURL();
                    fileSrc = this.webview.convertFileSrc(fileSrc);
                    src = this.sanitizer.bypassSecurityTrustResourceUrl(fileSrc);

                } catch (e) {
                    // if the custom icon is not available, use the default one
                    src = this.icons[i].asset;
                    IconProvider.log.warn(() => `unable to load custom icon ${fileName} in ${path}, resulted in error ${e.message}`);
                }
                IconProvider.src.set(icon.key, src);
            }
        } else {
            for(let i: number = 0; i < this.icons.length; i++) {
                IconProvider.src.set(this.icons[i].key, this.icons[i].asset);
            }
        }
    }
}
