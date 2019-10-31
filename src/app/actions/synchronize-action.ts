/** angular */
import {ModalController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {SynchronizationService} from "../services/synchronization.service";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";

export class SynchronizeAction extends ILIASObjectAction {

    constructor(public title: string,
                public object: ILIASObject,
                public sync: SynchronizationService,
                public modal: ModalController,
                public translate: TranslateService) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        return this.sync.addObjectsToSyncQueue(this.object)
            .then(() => Promise.resolve(new ILIASObjectActionNoMessage()));
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }

}
