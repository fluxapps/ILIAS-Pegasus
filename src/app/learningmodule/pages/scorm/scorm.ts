import { Component, ElementRef, Inject, Injectable, ViewChild } from "@angular/core";
import {ActivatedRoute, ParamMap} from "@angular/router";
import { Logger } from "../../../services/logging/logging.api";
import { Logging } from "../../../services/logging/logging.service";
import {LEARNING_MODULE_PATH_BUILDER, LearningModulePathBuilder} from "../../services/learning-module-path-builder";
import {AuthenticationProvider} from "../../../providers/authentication.provider";
import {LearningModule} from "../../models/learning-module";
import {User} from "../../../models/user";
import {ILIASObject} from "../../../models/ilias-object";

@Component({
    selector: "page-scorm",
    templateUrl: "scorm.html",
    styleUrls: ["./scorm.css"]
})
@Injectable({
    providedIn: "root"
})
export class ScormPage {

    title: string = "";

    private readonly log: Logger = Logging.getLogger("ScormPage");

    constructor(
        private readonly route: ActivatedRoute,
        @Inject(LEARNING_MODULE_PATH_BUILDER) private readonly pathBuilder: LearningModulePathBuilder,
    ) {}

    async ionViewDidEnter(): Promise<void> {
        // get data for the lm
        const params: ParamMap = this.route.snapshot.paramMap;
        const lmId: number = parseInt(params.get("id"), 10);
        const user: User = AuthenticationProvider.getUser();
        const lm: LearningModule = await LearningModule.findByObjIdAndUserId(lmId, user.id);
        const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(lm.objId, user.id);
        this.title = obj.title;

        // get manifest
        let manifest: string = await lm.getLocalStartFileUrl(this.pathBuilder);
        manifest = manifest.replace("file://", "_app_file_");
        this.log.info(() => `got manifest file at ${manifest}`);

        //@ts-ignore
        window.Run.ManifestByURL(manifest, true);
    }

}
