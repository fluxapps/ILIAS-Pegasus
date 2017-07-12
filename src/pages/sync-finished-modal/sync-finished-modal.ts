import {Component} from '@angular/core';
import {SyncResults} from "../../services/synchronization.service";
import {TranslateService} from "ng2-translate/ng2-translate";
import {LeftOutReason} from "../../services/synchronization.service";
import {NavParams} from "ionic-angular/index";
import {ViewController} from "ionic-angular/index";

@Component({
    templateUrl: 'sync-finished-modal.html',
})
export class SyncFinishedModal {

    public title = '';

    public totalItems:number;
    public updated:number;
    public tooBigs:Promise<string>[];
    public noMoreSpace:Promise<string>[];
    public uptodate:number;

    /**
     * @param params
     */
    constructor(params: NavParams,
                public translate:TranslateService,
                public viewCtrl: ViewController) {
        let syncResult:SyncResults = params.get('syncResult');
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


    public closeModal() {
        this.viewCtrl.dismiss();
    }

    protected getPathToObject(object) {
        return object.getParentsTitleChain()
            .then(parentTitles => parentTitles.join("/"))
    }
}
