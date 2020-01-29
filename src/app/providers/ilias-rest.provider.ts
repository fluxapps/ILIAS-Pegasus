/** angular */
import {Inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
/** ionic-native */
import {File, FileEntry, Flags} from "@ionic-native/file/ngx";
/** ilias */
import {ClientCredentials, OAUTH2_DATA_SUPPLIER, OAuth2DataSupplier} from "./ilias/ilias.rest-api";
import {ILIAS_REST, ILIASRequestOptions, ILIASRest, TOKEN_MANAGER, TokenManager} from "./ilias/ilias.rest";
/** logging */
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
/** misc */
import {DownloadRequestOptions, FILE_DOWNLOADER, FileDownloader} from "./file-transfer/file-download";
import {HttpResponse} from "./http";
import {User} from "../models/user";

const DEFAULT_OPTIONS: ILIASRequestOptions = <ILIASRequestOptions>{accept: "application/json"};

@Injectable({
    providedIn: "root"
})
export class ILIASRestProvider {

    private readonly log: Logger = Logging.getLogger(ILIASRestProvider.name);

    constructor(
        private readonly http: HttpClient,
        @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest,
        @Inject(FILE_DOWNLOADER) private readonly donwloader: FileDownloader,
        @Inject(OAUTH2_DATA_SUPPLIER) private readonly dataSupplier: OAuth2DataSupplier,
        @Inject(TOKEN_MANAGER) private readonly tokenManager: TokenManager,
        private readonly file: File
    ) {}

    async getAuthToken(user: User): Promise<string> {

        const response: HttpResponse = await this.iliasRest.get("/v2/ilias-app/auth-token", DEFAULT_OPTIONS);

        return response.handle(it =>
            it.json<AuthToken>(authTokenSchema).token
        );
    }

    async getDesktopData(user: User): Promise<Array<DesktopData>> {

        const response: HttpResponse = await this.iliasRest.get("/v2/ilias-app/desktop", DEFAULT_OPTIONS);

        return response.handle(it =>
            it.json<Array<DesktopData>>(desktopDataSchema)
        );
    }

    async getObjectData(parentRefId: number, user: User, recursive: boolean = false, timeout: number = 0): Promise<Array<DesktopData>> {
        const opt: ILIASRequestOptions = (recursive)? {accept: "application/json", urlParams: [["recursive", "1"]]} : DEFAULT_OPTIONS;

        const response: HttpResponse = await this.iliasRest.get(`/v2/ilias-app/objects/${parentRefId}`, opt);

        return response.handle(it =>
            it.json<Array<DesktopData>>(desktopDataSchema)
        );
    }

    async getFileData(refId: number, user: User, timeout: number = 0): Promise<FileData> {
        const response: HttpResponse = await this.iliasRest.get(`/v3/ilias-app/files/${refId}`, DEFAULT_OPTIONS);

        return response.handle(it =>
            it.json<FileData>(fileSchema)
        );
    }

    async downloadFile(refId: number, storageLocation: string, fileName: string): Promise<FileEntry> {

        const credentials: ClientCredentials = await this.dataSupplier.getClientCredentials();
        const url: string = `${credentials.apiURL}/v1/files/${refId}`;
        const header: object = {
            Authorization: `${credentials.token.type} ${await this.tokenManager.getAccessToken()}`
        };

        const filePath: string = `${storageLocation}${fileName}`;
        const downloadOptions: DownloadRequestOptions = <DownloadRequestOptions>{
            url: url,
            filePath: filePath,
            body: "",
            followRedirects: true,
            headers: header,
            timeout: 0
        };

        await this.donwloader.download(downloadOptions);
        return this.file.getFile(await this.file.resolveDirectoryUrl(storageLocation),fileName, <Flags> {
            create: false,
            exclusive: false
        });
    }

    /**
     * Posts learning-progress-to-done matching the given {@code fileRefId}
     *
     * @param {number} fileRefId - a reference id in ILIAS of the file
     * @throws {HttpRequestError} if the request fails
     */
    async postLearningProgressDone(fileRefId: number): Promise<void> {
        const response: HttpResponse = await this.iliasRest.post(
            `/v3/ilias-app/files/${fileRefId}/learning-progress-to-done`,
            {},
            <ILIASRequestOptions>{contentType: "application/json"}
        );

        return response.handle<void>(_ => {
            this.log.trace(() => `Successfully posted learning-progress-to-done for iliasRefId ${fileRefId}`);
        });
    }

    async getThemeData(): Promise<ThemeData> {
        const response: HttpResponse = await this.iliasRest.get("/v3/ilias-app/theme", DEFAULT_OPTIONS);

        return response.handle(it =>
            it.json<ThemeData>(themeSchema)
        );
    }
}

interface AuthToken {
    token: string
}

const authTokenSchema: object = {
    "title": "auth-token",
    "type": "object",
    "properties": {
        "token": {
            "type": "string",
        },
        "required": ["token"]
    }
};

export interface DesktopData {
    objId: string
    title: string
    description: string
    hasPageLayout: boolean
    hasTimeline: boolean
    permissionType: string
    refId: string
    parentRefId: string
    type: string
    link: string
    repoPath: Array<string>
}
//TODO: make description/items/title properties not nullable. Check null in Rest plugin.
const desktopDataSchema: object = {
    "title": "desktop-data",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "objId": {"type": "string"},
            "title": {"type": ["string", "null"]},
            "description": {"type": ["string", "null"]},
            "hasPageLayout": {"type": "boolean"},
            "hasTimeline": {"type": "boolean"},
            "permissionType": {"type": "string"},
            "refId": {"type": "string"},
            "parentRefId": {"type": "string"},
            "type": {"type": "string"},
            "link": {"type": "string"},
            "repoPath": {
                "type": "array",
                "items": {
                    "type": ["string", "null"]
                }
            }
        },
        "required": ["objId", "title", "description", "hasPageLayout", "hasTimeline",
            "permissionType", "refId", "parentRefId", "type", "link", "repoPath"]
    }
};

export interface FileData {
    fileExtension: string
    fileName: string
    fileSize: string
    fileType: string
    fileVersion: string
    fileVersionDate: string
    fileLearningProgress: boolean
}

const fileSchema: object = {
    "title": "file-data",
    "type": "object",
    "properties": {
        "fileExtension": {"type": "string"},
        "fileName": {"type": "string"},
        "fileSize": {"type": "string"},
        "fileType": {"type": "string"},
        "fileVersion": {"type": "string"},
        "fileVersionDate": {"type": "string"},
        "fileLearningProgress": {"type": "boolean"}
    },
    "required": ["fileExtension", "fileName", "fileSize", "fileType", "fileVersion", "fileVersionDate", "fileLearningProgress"]
};

export interface ThemeData {
    themePrimaryColor: string,
    themeContrastColor: boolean
}

const themeSchema: object = {
    "title": "theme-data",
    "type": "object",
    "properties": {
        "themePrimaryColor": {"type": "string"},
        "themeContrastColor": {"type": "boolean"}
    },
    "required": ["themePrimaryColor", "themeContrastColor"]
};
