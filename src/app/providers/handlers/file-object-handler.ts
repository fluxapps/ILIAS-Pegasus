/** angular */
import { Injectable } from "@angular/core";
/** ilias */
import { ILIASRestProvider } from "../ilias-rest.provider";
import { DataProviderILIASObjectHandler } from "./ilias-object-handler";
/** models */
import { User } from "../../models/user";
import { ILIASObject } from "../../models/ilias-object";
import { FileData } from "../../models/file-data";
/** misc */
import { FileService } from "../../services/file.service";
import { FileData as FileMetaData } from "../ilias-rest.provider";

@Injectable({
    providedIn: "root"
})
export class DataProviderFileObjectHandler implements DataProviderILIASObjectHandler {

    constructor(
        private readonly rest: ILIASRestProvider,
        private readonly file: FileService
    ) {
    }

    onSave(iliasObject: ILIASObject, user: User): Promise<ILIASObject> {
        return this.getFileMetaData(iliasObject, user);
    }

    async onDelete(iliasObject: ILIASObject, user: User): Promise<void> {
        // Note: Order matters! FileService::remove still needs FileData
        await this.file.removeFile(iliasObject)
        const fileData = await FileData.find(iliasObject.id);
        await fileData.destroy();
    }

    /**
     * Gets file metadata for the given ILIASObject and stores it as FileData object and in the objects data property
     * @param iliasObject
     * @param user
     * @returns {Promise<ILIASObject>}
     */
    async getFileMetaData(iliasObject: ILIASObject, user: User): Promise<ILIASObject> {

        const fileMetaData: FileMetaData = await this.rest.getFileData(iliasObject.refId, user, 120000);
        const localFileData: FileData = await FileData.find(iliasObject.id);

        localFileData.readFromObject(fileMetaData);
        iliasObject.needsDownload = localFileData.needsDownload();
        await localFileData.save();

        iliasObject.data = Object.assign(iliasObject.data, fileMetaData);
        await iliasObject.save();

        return iliasObject;
    }

}
