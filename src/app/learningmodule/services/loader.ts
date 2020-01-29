import {Inject, Injectable, InjectionToken} from "@angular/core";
import {ILIAS_REST, ILIASRequestOptions, ILIASRest} from "../../providers/ilias/ilias.rest";
import {HttpResponse} from "../../providers/http";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
import {ILIASObject} from "../../models/ilias-object";
import {User} from "../../models/user";

export interface LearningModuleLoader {
    /**
     * Loads all relevant data of the learnplace matching
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
        @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest
    ) {}

    async load(objId: number): Promise<void> {
        const user: User = AuthenticationProvider.getUser();
        const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(objId, user.id);
        const data: LearningModuleData = await this.getLearningModuleData(obj.refId);
        // TODO dev load files and log startfile
    }

    private async getLearningModuleData(refId: number): Promise<LearningModuleData> {
        const response: HttpResponse = await this.iliasRest.get(`/v1/learning-module/${refId}`, DEFAULT_OPTIONS);

        return response.handle(it =>
            it.json<LearningModuleData>(learningModuleSchema)
        );
    }
}

const learningModuleSchema: object = {
    "title": "learning-module-data",
    "type": "object",
    "properties": {
        "startFile": {"type": "string"},
        "dirList": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "fileList": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["startFile", "dirList", "fileList"]
};

export interface LearningModuleData {
    startFile: string,
    dirList: Array<{"key": string, "path": string}>
    fileList: Array<{"key": string, "path": string}>
}
