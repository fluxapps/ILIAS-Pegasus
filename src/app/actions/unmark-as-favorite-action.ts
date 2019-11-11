import {ILIASObject} from "../models/ilias-object";
import {FileService} from "../services/file.service";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";

export class UnMarkAsFavoriteAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public object: ILIASObject,
        public file: FileService
    ) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        // if the object is currently downloading, the syncService will execute the removal
        if(this.object.isFavorite !== 2) await this.object.removeFromFavorites(this.file);
        else await this.object.setIsFavorite(0);
        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}
