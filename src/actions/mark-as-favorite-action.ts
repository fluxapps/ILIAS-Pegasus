import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {DataProvider} from "../providers/data-provider.provider";
import {SynchronizationService} from "../services/synchronization.service";
import {Events, ModalController} from "ionic-angular";
import {MarkAsOfflineAvailableAction} from "./mark-as-offline-available-action";

export class MarkAsFavoriteAction extends ILIASObjectAction {

    readonly offlineAction: MarkAsOfflineAvailableAction;

    constructor(
        public title: string,
        public object: ILIASObject,
        public dataProvider: DataProvider,
        public syncService: SynchronizationService,
        public modal: ModalController,
        public events: Events
    ) {
        super();
        this.offlineAction = new MarkAsOfflineAvailableAction(title, object, dataProvider, syncService, modal);
    }

    execute(): Promise<ILIASObjectActionResult> {
        this.events.publish("favorites:changed");
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
