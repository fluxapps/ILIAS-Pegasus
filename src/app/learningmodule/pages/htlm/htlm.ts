import { Component, Inject } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {ActivatedRoute, ParamMap} from "@angular/router";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Observable, ReplaySubject } from "rxjs";
import { Logger } from "../../../services/logging/logging.api";
import { Logging } from "../../../services/logging/logging.service";
import {LEARNING_MODULE_PATH_BUILDER, LearningModulePathBuilder} from "../../services/learning-module-path-builder";
import {AuthenticationProvider} from "../../../providers/authentication.provider";
import {LearningModule} from "../../models/learning-module";
import {User} from "../../../models/user";
import {ILIASObject} from "../../../models/ilias-object";

@Component({
    selector: "page-htlm",
    templateUrl: "htlm.html"
})
export class HtlmPage {

    private readonly safeEntryPoint: ReplaySubject<SafeResourceUrl> = new ReplaySubject<SafeResourceUrl>(1);
    title: string = "";
    entryPoint: Observable<SafeResourceUrl> = this.safeEntryPoint.asObservable();

    private readonly log: Logger = Logging.getLogger("HtlmPage");

    constructor(
        private readonly route: ActivatedRoute,
        @Inject(LEARNING_MODULE_PATH_BUILDER) private readonly pathBuilder: LearningModulePathBuilder,
        private readonly sanitizer: DomSanitizer,
        private readonly webView: WebView
    ) {
        this.safeEntryPoint.next(this.sanitizer.bypassSecurityTrustResourceUrl(""));
    }

    async ionViewDidEnter(): Promise<void> {
        // get data for the lm
        const params: ParamMap = this.route.snapshot.paramMap;
        const lmId: number = parseInt(params.get("id"), 10);
        const user: User = AuthenticationProvider.getUser();
        const lm: LearningModule = await LearningModule.findByObjIdAndUserId(lmId, user.id);
        const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(lm.objId, user.id);
        this.title = obj.title;

        // get manifest
        const url: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.webView.convertFileSrc(
                await lm.getLocalStartFileUrl(this.pathBuilder)
            )
        );
        this.safeEntryPoint.next(url);
        this.safeEntryPoint.complete();
    }

}
