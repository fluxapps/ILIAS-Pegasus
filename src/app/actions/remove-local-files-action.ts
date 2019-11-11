import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionSuccess, ILIASObjectActionResult} from "./object-action";
import {FileService} from "../services/file.service";
import {TranslateService} from "@ngx-translate/core";

export class RemoveLocalFilesAction extends ILIASObjectAction {

    constructor(public title: string, public containerObject: ILIASObject, public file: FileService, public translate: TranslateService) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        await this.file.removeRecursive(this.containerObject);
        return new ILIASObjectActionSuccess(this.translate.instant("actions.removed_local_files"));
    }

    alert(): ILIASObjectActionAlert {
        return {
            title: this.translate.instant("actions.remove_local_files_in", {title: this.containerObject.title}),
            subTitle: this.translate.instant("actions.remove_local_files_in_text"),
        }
    }

}
