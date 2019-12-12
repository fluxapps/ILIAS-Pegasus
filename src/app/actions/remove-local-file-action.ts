import {ILIASObject} from "../models/ilias-object";
import {FileService} from "../services/file.service";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionResult, ILIASObjectActionSuccess} from "./object-action";
import {TranslateService} from "@ngx-translate/core";

export class RemoveLocalFileAction extends ILIASObjectAction {

    constructor(public title: string, public fileObject: ILIASObject, public file: FileService, private readonly translation: TranslateService) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        await this.file.removeFile(this.fileObject);
        return new ILIASObjectActionSuccess(this.translation.instant("actions.removed_local_file"));
    }

    alert(): ILIASObjectActionAlert {
        return {
            title: "Delete downloaded file " + this.fileObject.title,
            subTitle: "Are you sure you want to delete this file?",
        }
    }
}
