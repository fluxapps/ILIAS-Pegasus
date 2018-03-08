import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionSuccess} from "./object-action";
import {FileService} from "../services/file.service";
import {ILIASObjectActionResult} from "./object-action";
import {TranslateService} from "ng2-translate/ng2-translate";

export class RemoveLocalFilesAction extends ILIASObjectAction {

    constructor(public title: string, public containerObject: ILIASObject, public file: FileService, public translate: TranslateService) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        return this.file.removeRecursive(this.containerObject)
            .then(() => new ILIASObjectActionSuccess(this.translate.instant("actions.removed_local_files")));
    }

    alert(): ILIASObjectActionAlert {
        return {
            title: this.translate.instant("actions.remove_local_files_in", {title: this.containerObject.title}),
            subTitle: this.translate.instant("actions.remove_local_files_in_text"),
        }
    }

}