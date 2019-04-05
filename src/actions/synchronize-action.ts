import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {SynchronizationService} from "../services/synchronization.service";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionSuccess} from "./object-action";
import {ModalController} from "ionic-angular";
import {TranslateService} from "ng2-translate/ng2-translate";
import {ILIASObjectActionNoMessage} from "./object-action";
import {SyncFinishedModal} from "../pages/sync-finished-modal/sync-finished-modal";

export class SynchronizeAction extends ILIASObjectAction {

    constructor(public title: string,
                       public object: ILIASObject,
                       public sync: SynchronizationService,
                        public modal: ModalController,
                        public translate: TranslateService) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        return this.sync.liveLoad(this.object)
            .then(() => Promise.resolve(
                new ILIASObjectActionSuccess(this.translate.instant("sync.object_synced", {title: this.object.title} ))
            ));
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }

}
