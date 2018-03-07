import {Injectable} from "@angular/core";
import {ILIASRestProvider} from "../ilias-rest.provider";
import {User} from "../../models/user";
import {FileService} from "../../services/file.service";
import {FileData} from "../../models/file-data";
import {DataProviderILIASObjectHandler} from "./ilias-object-handler";
import {ILIASObject} from "../../models/ilias-object";


@Injectable()
export class DataProviderFileObjectHandler implements DataProviderILIASObjectHandler {

    constructor(protected rest: ILIASRestProvider,
                       protected file: FileService) {
    }

    onSave(iliasObject: ILIASObject, user: User): Promise<ILIASObject> {
        return this.getFileMetaData(iliasObject, user);
    }

    onDelete(iliasObject: ILIASObject, user: User): Promise<any> {
        // Note: Order matters! FileService::remove still needs FileData
        return this.file.remove(iliasObject)
            .then(() => FileData.find(iliasObject.id))
            .then(fileData => fileData.destroy());
    }

    /**
     * Gets file metadata for the given ILIASObject and stores it as FileData object and in the objects data property
     * @param iliasObject
     * @param user
     * @returns {Promise<ILIASObject>}
     */
    getFileMetaData(iliasObject: ILIASObject, user: User): Promise<ILIASObject> {

        let fileMetaData;

        return this.rest.getFileData(iliasObject.refId, user, 120000)
            .then(aFileMetaData => {
                fileMetaData = aFileMetaData;
                return FileData.find(iliasObject.id);
            }).then((fileData: FileData) => {
                fileData.readFromObject(fileMetaData);
                iliasObject.needsDownload = fileData.needsDownload();
                return fileData.save() as Promise<ILIASObject>;
            }).then(() => {
                iliasObject.data = Object.assign(iliasObject.data, fileMetaData);
                return iliasObject.save() as Promise<ILIASObject>;
            });
    }

}
