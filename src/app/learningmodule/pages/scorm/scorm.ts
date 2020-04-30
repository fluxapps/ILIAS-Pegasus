import {Component, Inject, Injectable} from "@angular/core";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {LEARNING_MODULE_PATH_BUILDER, LearningModulePathBuilder} from "../../services/learning-module-path-builder";
import {AuthenticationProvider} from "../../../providers/authentication.provider";
import {LearningModule} from "../../models/learning-module";
import {User} from "../../../models/user";
import {ILIASObject} from "../../../models/ilias-object";

@Component({
    selector: "page-scorm",
    templateUrl: "scorm.html",
})
@Injectable({
    providedIn: "root"
})
export class ScormPage {

    title: string = "";

    private sourceRoot: string = "assets/scormplayer/";

    private loadingTag: string = "SCORM_PLAYER_SCRIPTS";

    private scripts: Array<string> = [
        "scormpool/Lib/sscompat.js",
        "scormpool/Lib/sscorlib.js",
        "scormpool/Lib/ssfx.Core.js",
        "scormpool/Lib/API_BASE.js",
        "scormpool/Lib/API.js",
        "scormpool/Lib/API_1484_11.js",
        "scormpool/Lib/Controls.js",
        "scormpool/Lib/LocalStorage.js",
        "scormpool/Lib/Player.js",
        "style.css",
        "setup_player.js"
    ];

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

        // load the scripts
        let cnt: number = 0;
        const scriptsLoaded: boolean = window.hasOwnProperty(this.loadingTag);
        if(!scriptsLoaded) {
            // inject scripts
            this.scripts.forEach(src => {
                cnt++;
                setTimeout(() => {
                    console.log(`loading file '${src}'`);

                    src = `${this.sourceRoot}${src}`;
                    let element: HTMLScriptElement | HTMLLinkElement;
                    const extension: string = src.split(".").pop();
                    switch (extension) {
                        case "js":
                            element = document.createElement("script");
                            element.src = src;
                            break;
                        case("css"):
                            element = document.createElement("link");
                            element.type = "text/css";
                            element.href = src;
                            break;
                        default:
                            console.warn(`extension '${extension}' not supported of file '${src}'`);
                            return;
                    }
                    document.head.appendChild(element);
                }, 100 * cnt);
            });

            // set the loaded variable
            window[this.loadingTag] = true;
        }

        // get manifest
        let manifest: string = await lm.getLocalStartFileUrl(this.pathBuilder);
        manifest = manifest.replace("file://", "_app_file_");
        console.log(`got manifest file at ${manifest}`);

        // load manifest file in player
        cnt++;
        setTimeout(() => {
            console.log("loading manifest in player");

            const element: HTMLScriptElement = document.createElement("script");
            element.innerHTML = `Run.ManifestByURL("${manifest}", true);`;
            document.head.appendChild(element);
        }, 100 * cnt);
    }

}
