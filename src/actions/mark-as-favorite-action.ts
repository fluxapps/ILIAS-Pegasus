import {ILIASObject} from "../models/ilias-object";
import {
    ILIASObjectAction,
    ILIASObjectActionAlert,
    ILIASObjectActionNoMessage,
    ILIASObjectActionResult
} from "./object-action";
import {DataProvider} from "../providers/data-provider.provider";
import {SynchronizationService} from "../services/synchronization.service";
import {ModalController} from "ionic-angular";
import {MarkAsOfflineAvailableAction} from "./mark-as-offline-available-action";

export class MarkAsFavoriteAction extends ILIASObjectAction {

    readonly offlineAction: MarkAsOfflineAvailableAction;

    constructor(
        public title: string,
        public object: ILIASObject,
        public dataProvider: DataProvider,
        public syncService: SynchronizationService,
        public modal: ModalController
    ) {
        super();
        this.offlineAction = new MarkAsOfflineAvailableAction(title, object, dataProvider, syncService, modal);
    }

    execute(): Promise<ILIASObjectActionResult> {
        return this.offlineAction.execute()
            .then(() => {
                this.object.isFavorite = 1;
                return this.object.save()
                    .then(() => Promise.resolve(new ILIASObjectActionNoMessage()));
            });
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }

}
