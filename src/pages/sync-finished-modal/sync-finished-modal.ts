/** angular */
import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {ILIASObject} from "../../models/ilias-object";
import {LeftOutReason, SyncResults} from "../../services/synchronization.service";

@Component({
    templateUrl: "sync-finished-modal.html",
})
export class SyncFinishedModal {

    title = "";

    totalItems: number;
    updated: number;
    tooBigs: Array<Promise<string>>;
    noMoreSpace: Array<Promise<string>>;
    uptodate: number;

    /**
     * @param params
     * @param translate
     *
     * @param viewCtrl
     */
    constructor(params: NavParams,
                public translate: TranslateService,
                public viewCtrl: ViewController) {
        const syncResult: SyncResults = params.get("syncResult");
        this.title = this.translate.instant("sync.title");
        this.totalItems = syncResult.totalObjects.length;
        this.updated = syncResult.objectsDownloaded.length;
        this.uptodate = syncResult.objectsUnchanged.length;
        this.tooBigs = [];
        syncResult.objectsLeftOut.forEach(item => {
           if(item.reason == LeftOutReason.FileTooBig) {
                this.tooBigs.push(this.getPathToObject(item.object));
            }
        });

        this.noMoreSpace = [];
        syncResult.objectsLeftOut.forEach(item => {
            if(item.reason == LeftOutReason.QuotaExceeded) {
                this.noMoreSpace.push(this.getPathToObject(item.object));
            }
        });
    }


    closeModal(): void {
        this.viewCtrl.dismiss();
    }

    private getPathToObject(object: ILIASObject): Promise<string> {
        return object.getParentsTitleChain()
            .then(parentTitles => parentTitles.join("/"))
    }
}
