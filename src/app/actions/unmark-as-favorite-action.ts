import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";
import {UserStorageService} from "../services/filesystem/user-storage.service";

export class UnMarkAsFavoriteAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public object: ILIASObject,
        public userStorage: UserStorageService
    ) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        // if the object is currently downloading, the syncService will execute the removal
        if(this.object.isFavorite !== 2) await this.object.removeFromFavorites(this.userStorage);
        else await this.object.setIsFavorite(0);
        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}
