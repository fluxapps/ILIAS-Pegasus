var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/** angular */
import { Injectable } from "@angular/core";
/** ilias */
import { ILIASRestProvider } from "../ilias-rest.provider";
import { FileData } from "../../models/file-data";
/** misc */
import { FileService } from "../../services/file.service";
var DataProviderFileObjectHandler = /** @class */ (function () {
    function DataProviderFileObjectHandler(rest, file) {
        this.rest = rest;
        this.file = file;
    }
    DataProviderFileObjectHandler.prototype.onSave = function (iliasObject, user) {
        return this.getFileMetaData(iliasObject, user);
    };
    DataProviderFileObjectHandler.prototype.onDelete = function (iliasObject, user) {
        // Note: Order matters! FileService::remove still needs FileData
        return this.file.removeFile(iliasObject)
            .then(function () { return FileData.find(iliasObject.id); })
            .then(function (fileData) { return fileData.destroy(); });
    };
    /**
     * Gets file metadata for the given ILIASObject and stores it as FileData object and in the objects data property
     * @param iliasObject
     * @param user
     * @returns {Promise<ILIASObject>}
     */
    DataProviderFileObjectHandler.prototype.getFileMetaData = function (iliasObject, user) {
        var fileMetaData;
        return this.rest.getFileData(iliasObject.refId, user, 120000)
            .then(function (aFileMetaData) {
            fileMetaData = aFileMetaData;
            return FileData.find(iliasObject.id);
        }).then(function (fileData) {
            fileData.readFromObject(fileMetaData);
            iliasObject.needsDownload = fileData.needsDownload();
            return fileData.save();
        }).then(function () {
            iliasObject.data = Object.assign(iliasObject.data, fileMetaData);
            return iliasObject.save();
        });
    };
    DataProviderFileObjectHandler = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [ILIASRestProvider,
            FileService])
    ], DataProviderFileObjectHandler);
    return DataProviderFileObjectHandler;
}());
export { DataProviderFileObjectHandler };
//# sourceMappingURL=file-object-handler.js.map