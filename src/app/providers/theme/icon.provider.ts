import { DomSanitizer, SafeResourceUrl, SafeUrl } from "@angular/platform-browser";
import {Inject, Injectable} from "@angular/core";
import {File} from "@ionic-native/file/ngx";
import {WebView} from "@ionic-native/ionic-webview/ngx";
import {Settings} from "../../models/settings";
import { Logger } from "../../services/logging/logging.api";
import { Logging } from "../../services/logging/logging.service";
import {AuthenticationProvider} from "../authentication.provider";
import {CssStyleService} from "../../services/theme/css-style.service";
import {ThemeSynchronizationService} from "../../services/theme/theme-synchronization.service";
import {FileStorageService} from "../../services/filesystem/file-storage.service";
import { Filesystem, FILESYSTEM_TOKEN } from "src/app/services/filesystem";


@Injectable({
    providedIn: "root"
})
export class IconProvider {
    private readonly defaultIconKey: string = "fallback";
    private readonly src: Map<string, SafeResourceUrl> = new Map<string, SafeResourceUrl>();
    private readonly log: Logger = Logging.getLogger("IconProvider");

    private icons: Array<{key: string, loadedName: string}> = [
        {key: "crs", loadedName: "course.svg"},
        {key: "fold", loadedName: "folder.svg"},
        {key: "grp", loadedName: "group.svg"},
        {key: "file", loadedName: "file.svg"},
        {key: "xsrl", loadedName: "learningplace.svg"},
        {key: "htlm", loadedName: "learningmodule.svg"},
        {key: "sahs", loadedName: "learningmodule.svg"},
        {key: "webr", loadedName: "link.svg"}
    ];

    constructor(
        private readonly fileStorage: FileStorageService,
        private readonly filesystem: File,
        @Inject(FILESYSTEM_TOKEN) private readonly fsService: Filesystem,
        private readonly webview: WebView,
        private readonly sanitizer: DomSanitizer
    ) {}

    async getIconSrc(key: string): Promise<string | SafeUrl> {
        if (this.src.has(key))
            return this.src.get(key);

        try {
            if (await this.filesystem.checkFile(`${this.filesystem.applicationDirectory}/www/assets/icon/`, `icon_${key}.svg`))
                return `assets/icon/icon_${key}.svg`;            
        } catch (err) {
            this.log.warn(() => `Couldn't find icon icon_${key}.svg`);
            
            if (this.src.has(this.defaultIconKey))
                return this.src.get(this.defaultIconKey);
            else 
                return `assets/icon/icon_${this.defaultIconKey}.svg`;
        }
    }

    async loadResources(): Promise<void> {
        if(CssStyleService.dynamicThemeEnabled() && await ThemeSynchronizationService.dynamicThemeAvailable()) {
            const path: string = await this.fileStorage.dirForUser("icons");
            for(let i: number = 0; i < this.icons.length; i++) {
                const icon: {key: string, loadedName: string}= this.icons[i];
                const settings: Settings = await AuthenticationProvider.getUser().settings;
                const fileName: string = `${settings.themeTimestamp}_${icon.loadedName}`;
                let src: string | SafeResourceUrl;
                try {
                    let fileSrc: string = (await this.filesystem.resolveLocalFilesystemUrl(`${path}${fileName}`)).toURL();
                    fileSrc = this.webview.convertFileSrc(fileSrc);
                    src = this.sanitizer.bypassSecurityTrustResourceUrl(fileSrc);
                    this.src.set(icon.key, src)
                } catch (e) {
                    this.log.warn(() => `unable to load custom icon ${fileName} in ${path}, resulted in error ${e.message}`);
                }
            }
        }
    }
}
