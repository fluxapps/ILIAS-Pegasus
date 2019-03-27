import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {SynchronizationService} from "../services/synchronization.service";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionSuccess} from "./object-action";
import {ModalController} from "ionic-angular";
import {TranslateService} from "ng2-translate/ng2-translate";
import {ILIASObjectActionNoMessage} from "./object-action";
import {SyncFinishedModal} from "../pages/sync-finished-modal/sync-finished-modal";
import {Profiler} from "../util/profiler";

export class SynchronizeAction extends ILIASObjectAction {

    constructor(public title: string,
                       public object: ILIASObject,
                       public sync: SynchronizationService,
                        public modal: ModalController,
                        public translate: TranslateService) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        Profiler.addCall("sync-action:execute")
            return this.sync.execute(this.object, true).then((syncResult) => {
                if(syncResult.objectsLeftOut.length > 0 ){
                    const syncModal = this.modal.create(SyncFinishedModal, {syncResult: syncResult});
                    syncModal.present();
                    return Promise.resolve(new ILIASObjectActionNoMessage());
                } else {
                    return Promise.resolve(new ILIASObjectActionSuccess(this.translate.instant("sync.object_synced", {title: this.object.title} )));
                }
            });
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }

}
