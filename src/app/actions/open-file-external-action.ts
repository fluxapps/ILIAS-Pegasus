import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionResult, ILIASObjectActionNoMessage} from "./object-action";
import {FileService} from "../services/file.service";

export class OpenFileExternalAction extends ILIASObjectAction {

    constructor(public title: string,
                       public fileObject: ILIASObject,
                       public file: FileService) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        await this.file.existsFile(this.fileObject);
        await this.file.open(this.fileObject);
        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }

}
