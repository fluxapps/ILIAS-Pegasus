import {ILIASObject} from "../models/ilias-object";
import {
    ILIASObjectAction,
    ILIASObjectActionAlert,
    ILIASObjectActionNoMessage,
    ILIASObjectActionResult
} from "./object-action";
import {User} from "../models/user";
import {FileService} from "../services/file.service";

export class UnMarkAsFavoriteAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public object: ILIASObject,
        public file: FileService
    ) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        const underFavorite: boolean = await this.objectIsUnderFavorite();
        if(!underFavorite) {
            await this.file.removeRecursive(this.object);
            const user: User = await User.currentUser();
            await ILIASObject.setOfflineAvailableRecursive(this.object, user, false);
        }

        await this.object.setIsFavorite(0);
        return Promise.resolve(new ILIASObjectActionNoMessage());
    }

    /**
     * Checks whether this.object is contained within a favorite-object
     */
    private async objectIsUnderFavorite(): Promise<boolean> {
        const parent: ILIASObject = await this.object.parent;
        return (parent === undefined) ? false : parent.isOfflineAvailable;
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }
}
