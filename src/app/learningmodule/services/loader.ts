import {Inject, Injectable, InjectionToken} from "@angular/core";
import {ILIAS_REST, ILIASRequestOptions, ILIASRest} from "../../providers/ilias/ilias.rest";
import {HttpResponse} from "../../providers/http";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
import {ILIASObject} from "../../models/ilias-object";
import {User} from "../../models/user";
import {UserStorageService} from "../../services/filesystem/user-storage.service";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {DownloadRequestOptions, FILE_DOWNLOADER, FileDownloader} from "../../providers/file-transfer/file-download";
import {Zip} from "@ionic-native/zip/ngx";

export interface LearningModuleLoader {
    /**
     * Loads all relevant data of the learnplace matching
     * the given {@code objectId} and stores them.
     */
    load(objectId: number): Promise<string> // TODO dev
}

const DEFAULT_OPTIONS: ILIASRequestOptions = <ILIASRequestOptions>{accept: "application/json"};
export const LEARNING_MODULE_LOADER: InjectionToken<LearningModuleLoader> = new InjectionToken("token for learning module loader");

@Injectable({
    providedIn: "root"
})
export class RestLearningModuleLoader implements LearningModuleLoader {
    constructor(
        protected readonly zip: Zip,
        protected readonly userStorage: UserStorageService,
        @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest,
        @Inject(FILE_DOWNLOADER) private readonly downloader: FileDownloader,
        @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
    ) {}

    async load(objId: number): Promise<string> {
        // get data for the learning module
        const user: User = AuthenticationProvider.getUser();
        const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(objId, user.id);
        const data: LearningModuleData = await this.getLearningModuleData(obj.refId);

        // name of the directory containing all learning modules
        const allLmsDirName: string = "learning_modules";
        // user-dependant path to all learning modules
        const localAllLmsDir: string = await this.userStorage.dirForUser(allLmsDirName, true);
        // name of the loading learning module directory
        const lmDirName: string = `lm_${objId}`;
        // path to the tmp directory for downloading
        const localTmpZipDir: string = await this.userStorage.dirForUser(`${allLmsDirName}/tmp`, true);
        // name of the zip file containing the learning module
        const tmpZipFile: string = `tmp_${objId}.zip`;
        // url to get the zip file containing the learning module
        const url: string = await this.linkBuilder.resource().resource(data.zipFile).build();

        // download the zip file
        const downloadOptions: DownloadRequestOptions = <DownloadRequestOptions> {
            url: url,
            filePath: `${localTmpZipDir}${tmpZipFile}`,
            body: "",
            followRedirects: true,
            headers: {},
            timeout: 0
        };

        // extract the zip file, place the lm in a specific directory, then delete the zip file
        await this.downloader.download(downloadOptions);
        await this.zip.unzip(`${localTmpZipDir}${tmpZipFile}`, localTmpZipDir);
        await this.userStorage.file.moveDir(localTmpZipDir, data.zipDirName, localAllLmsDir, lmDirName);
        await this.userStorage.removeFileIfExists(localTmpZipDir, tmpZipFile);

        return `${localAllLmsDir}${lmDirName}/${data.startFile}`;
    }

    private async getLearningModuleData(refId: number): Promise<LearningModuleData> {
        const response: HttpResponse = await this.iliasRest.get(`/v1/learning-module/${refId}`, DEFAULT_OPTIONS);
        return response.handle(it => {
            console.log(it.text());
            return it.json<LearningModuleData>(learningModuleSchema);
        });
    }
}

const learningModuleSchema: object = {
    "title": "learning-module-data",
    "type": "object",
    "properties": {
        "startFile": {"type": "string"},
        "zipFile": {"type": "string"},
        "zipDirName": {"type": "string"},
    },
    "required": ["startFile", "zipFile", "zipDirName"]
};

export interface LearningModuleData {
    startFile: string,
    zipFile: string,
    zipDirName: string,
}
