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
import {LearningModule} from "../../models/learning-module";
import {LEARNING_MODULE_PATH_BUILDER, LearningModulePathBuilder} from "./learning-module-path-builder";
import {LoadingPage} from "../../fallback/loading/loading.component";

export interface LearningModuleLoader {
    /**
     * Loads all relevant data of the learning module matching
     * the given {@code objectId} and stores them.
     */
    load(objectId: number): Promise<void>
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
        @Inject(LEARNING_MODULE_PATH_BUILDER) private readonly pathBuilder: LearningModulePathBuilder,
    ) {}

    async load(objId: number): Promise<void> {
        LoadingPage.progress.next(0);
        // get data for the learning module
        const user: User = AuthenticationProvider.getUser();
        const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(objId, user.id);
        const request: LearningModuleData = await this.getLearningModuleData(obj.refId);
        LoadingPage.progress.next(.2);
        const lm: LearningModule = await LearningModule.findByObjIdAndUserId(objId, user.id);

        // path to the tmp directory for downloading
        const localTmpZipDir: string = await this.pathBuilder.inLocalLmDir("tmp", true);
        // name of the zip file containing the learning module
        const tmpZipFile: string = `tmp_${objId}.zip`;
        // url to get the zip file containing the learning module
        const url: string = await this.linkBuilder.resource().resource(request.zipFile).build();

        // return if the module did not change and is already loaded
        const lmLoaded: boolean = await LearningModule.existsByObjIdAndUserId(objId, user.id);
        const lmUpToDate: boolean = lm.timestamp >= request.timestamp;
        if(lmLoaded && lmUpToDate) return;

        // download the zip file
        const downloadOptions: DownloadRequestOptions = <DownloadRequestOptions> {
            url: url,
            filePath: `${localTmpZipDir}${tmpZipFile}`,
            body: "",
            followRedirects: true,
            headers: {},
            timeout: 0
        };

        // user-dependant path to all learning modules
        const localAllLmsDir: string = await this.pathBuilder.inLocalLmDir("", true);
        // extract the zip file, place the lm in a specific directory, then delete the zip file
        await this.downloader.download(downloadOptions);
        LoadingPage.progress.next(.6);
        await this.zip.unzip(`${localTmpZipDir}${tmpZipFile}`, localTmpZipDir);
        LoadingPage.progress.next(.9);
        await this.userStorage.moveAndReplaceDir(localTmpZipDir, request.zipDirName, localAllLmsDir, this.pathBuilder.lmDirName(objId));
        await this.userStorage.removeFileIfExists(localTmpZipDir, tmpZipFile);
        LoadingPage.progress.next(1);

        // save the lm in the local database
        lm.relativeStartFile = request.startFile;
        lm.timestamp = request.timestamp;
        await lm.save();
    }

    private async getLearningModuleData(refId: number): Promise<LearningModuleData> {
        const response: HttpResponse = await this.iliasRest.get(`/v1/learning-module/${refId}`, DEFAULT_OPTIONS);
        return response.handle(it => it.json<LearningModuleData>(learningModuleSchema));
    }
}

const learningModuleSchema: object = {
    "title": "learning-module-data",
    "type": "object",
    "properties": {
        "startFile": {"type": "string"},
        "zipFile": {"type": "string"},
        "zipDirName": {"type": "string"},
        "timestamp": {"type": "number"},
    },
    "required": ["startFile", "zipFile", "zipDirName", "timestamp"],
};

export interface LearningModuleData {
    startFile: string,
    zipFile: string,
    zipDirName: string,
    timestamp: number,
}
