import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionSuccess} from "./object-action";
import {FileService} from "../services/file.service";
import {ILIASObjectActionResult} from "./object-action";

export class RemoveLocalFileAction extends ILIASObjectAction {

    constructor(public title: string, public fileObject: ILIASObject, public file: FileService) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            this.file.remove(this.fileObject).then(() => {
                resolve(new ILIASObjectActionSuccess("Sucessfully removed file"));
            });
        });
    }

    alert(): ILIASObjectActionAlert {
        return {
            title: "Delete downloaded file " + this.fileObject.title,
            subTitle: "Are you sure you want to delete this file?",
        }
    }

}