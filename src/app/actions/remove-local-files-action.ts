import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionSuccess, ILIASObjectActionResult} from "./object-action";
import {TranslateService} from "@ngx-translate/core";
import {UserStorageService} from "../services/filesystem/user-storage.service";

export class RemoveLocalFilesAction extends ILIASObjectAction {

    constructor(public title: string, public containerObject: ILIASObject, public userStorage: UserStorageService, public translate: TranslateService) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        await this.userStorage.removeRecursive(this.containerObject);
        return new ILIASObjectActionSuccess(this.translate.instant("actions.removed_local_files"));
    }

    alert(): ILIASObjectActionAlert {
        return {
            title: this.translate.instant("actions.remove_local_files_in", {title: this.containerObject.title}),
            subTitle: this.translate.instant("actions.remove_local_files_in_text"),
        }
    }

}
