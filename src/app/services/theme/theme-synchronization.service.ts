import {Inject, Injectable} from "@angular/core";
import {LocalStorageService} from "../local-storage.service";
import {LINK_BUILDER, LinkBuilder} from "../link/link-builder.service";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {ILIASRestProvider, ThemeData} from "../../providers/ilias-rest.provider";
import {Settings} from "../../models/settings";
import {DownloadRequestOptions, FILE_DOWNLOADER, FileDownloader} from "../../providers/file-transfer/file-download";
import {File} from "@ionic-native/file/ngx";

@Injectable({
    providedIn: "root"
})
export class ThemeSynchronizationService {
    constructor(
        private readonly rest: ILIASRestProvider,
        private readonly localStorage: LocalStorageService,
        @Inject(FILE_DOWNLOADER) private readonly downloader: FileDownloader,
        @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
        private readonly file: File
    ) {}

    /**
     * loads the parameters of the theme from ILIAS
     */
    async synchronize(): Promise<void> {
        // get theme data from the server
        const user: User = AuthenticationProvider.getUser();
        const themeData: ThemeData = await this.rest.getThemeData(user);

        // update settings accordingly
        const settings: Settings = await user.settings;
        const memThemeTimestamp: number = settings.themeTimestamp;
        settings.themeColorHex = `#${themeData.themePrimaryColor}`;
        settings.themeContrastColor = themeData.themeContrastColor;
        settings.themeTimestamp = themeData.themeTimestamp;
        await settings.save();

        // update icons
        for (let i: number = 0; i < themeData.themeIconResources.length; i++) {
            // load new icon
            const res: { "key": string, "path": string } = themeData.themeIconResources[i];
            const url: string = await this.linkBuilder.resource().resource(res.path).build();
            const path: string = await this.localStorage.dirForInstallationAndUser("icons", true);
            const file: string = `${themeData.themeTimestamp}_${res.key}.svg`;
            const downloadOptions: DownloadRequestOptions = <DownloadRequestOptions> {
                url: url,
                filePath: `${path}${file}`,
                body: "",
                followRedirects: true,
                headers: {},
                timeout: 0
            };
            await this.downloadAndCheckSvg(downloadOptions, path, file);
            // remove old icon
            const oldFile: string = `${memThemeTimestamp}_${res.key}.svg`;
            await this.localStorage.removeFileIfExists(path, oldFile);
        }
    }

    /**
     * Downloads an svg-file and checks whether the download has succeeded
     * @param download
     * @param path
     * @param file
     */
    private async downloadAndCheckSvg(download: DownloadRequestOptions, path: string, file: string): Promise<void> {
        for(let i: number = 0; i < 4; i++) {
            await this.downloader.download(download);
            try {
                const svg: string = await this.file.readAsText(path, file);
                if(svg.includes("svg")) return;
            } catch (e) {
                console.error(`problem when loading '${file}' to '${path}'`);
            }
        }
        throw new Error(`Unable to load '${path}' to '${file}'`);
    }
}
