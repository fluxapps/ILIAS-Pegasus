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
import { ILIASRestProvider } from "./ilias-rest.provider";
import { ILIASObject } from "../models/ilias-object";
import { DesktopItem } from "../models/desktop-item";
/** logging */
import { Log } from "../services/log.service";
/** misc */
import { DataProviderFileObjectHandler } from "./handlers/file-object-handler";
import { Profiler } from "../util/profiler";
var DataProvider = /** @class */ (function () {
    function DataProvider(rest, fileObjectHandler) {
        this.rest = rest;
        this.fileObjectHandler = fileObjectHandler;
    }
    /**
     * Get ILIAS objects on desktop
     * @param user
     * @returns {Promise<ILIASObject[]>}
     */
    DataProvider.prototype.getDesktopData = function (user) {
        var _this = this;
        return this.rest.getDesktopData(user)
            .then(function (data) { return _this.storeILIASDesktopObjects(data, user); })
            .then(function (objects) { return objects.sort(ILIASObject.compare); });
    };
    /**
     * Fetch and store ILIAS objects under the given parent ref-ID
     * @param parentObject
     * @param user
     * @param recursive
     * @param refreshFiles
     * @returns {Promise<ILIASObject[]>}
     */
    DataProvider.prototype.getObjectData = function (parentObject, user, recursive, refreshFiles) {
        var _this = this;
        if (refreshFiles === void 0) { refreshFiles = true; }
        return this.rest.getObjectData(parentObject.refId, user, recursive)
            .then(function (data) {
            return _this.storeILIASObjects(data, user, parentObject, recursive, refreshFiles);
        })
            .then(function (objects) {
            return objects.sort(ILIASObject.compare);
        });
    };
    /**
     * Creates or updates an ILIASObject based on data by a given JS-object (fetched from remote)
     * @param object
     * @param user
     * @param rootParent
     * @param refreshFiles
     * @returns {Promise<ILIASObject>}
     */
    DataProvider.prototype.storeILIASObject = function (object, user, rootParent, refreshFiles) {
        var _this = this;
        if (rootParent === void 0) { rootParent = undefined; }
        if (refreshFiles === void 0) { refreshFiles = true; }
        Log.write(this, "Storing ILIAS Object");
        var the_iliasObject = undefined;
        return ILIASObject.findByRefId(parseInt(object.refId, 10), user.id)
            .then(function (iliasObject) {
            iliasObject.readFromObject(object);
            the_iliasObject = iliasObject;
            return iliasObject;
        })
            .then(function (iliasObject) { return iliasObject.parent; })
            .then(function (parent) {
            if (the_iliasObject.id == 0 && parent != undefined)
                the_iliasObject.isNew = true;
            return the_iliasObject.save();
        })
            .then(function (iliasObject) {
            if (iliasObject.type == "file") {
                if (refreshFiles)
                    return _this.onSaveFile(user, iliasObject);
                else {
                    return iliasObject.save();
                }
            }
            else {
                return Promise.resolve(iliasObject);
            }
        });
    };
    DataProvider.prototype.onSaveFile = function (user, iliasObject) {
        var resolveObject;
        return this.fileObjectHandler.onSave(iliasObject, user)
            .then(function (iliasObject) {
            resolveObject = iliasObject;
            return iliasObject.updateNeedsDownload();
        }).then(function () {
            return Promise.resolve(resolveObject);
        });
    };
    /**
     * Stores courses and groups on desktop
     * @param objects
     * @param user
     * @returns {Promise<ILIASObject[]>}
     */
    DataProvider.prototype.storeILIASDesktopObjects = function (objects, user) {
        var _this = this;
        var iliasObjects = [];
        var promises = [];
        // We store desktop items that are only courses or groups
        objects.forEach(function (object) {
            var promise = _this.storeILIASObject(object, user).then(function (iliasObject) {
                iliasObjects.push(iliasObject);
            });
            promises.push(promise);
        });
        Log.write(this, "Storing Objects in Cache.");
        return Promise.all(promises)
            .then(function () { return DesktopItem.storeDesktopItems(user.id, iliasObjects); })
            .then(function () { return Promise.resolve(iliasObjects); });
    };
    /**
     * Stores (create, update) local ILIAS objects from the given objects fetched from remote.
     * This method also deletes local ILIAS objects not being delivered anymore
     * @param remoteObjects
     * @param user
     * @param parentObject
     * @param recursive
     * @param refreshFiles
     * @returns {Promise<ILIASObject[]>}
     */
    DataProvider.prototype.storeILIASObjects = function (remoteObjects, user, parentObject, recursive, refreshFiles) {
        var _this = this;
        if (recursive === void 0) { recursive = false; }
        if (refreshFiles === void 0) { refreshFiles = true; }
        if (recursive) {
            return ILIASObject.findByParentRefIdRecursive(parentObject.refId, user.id)
                .then(function (existingObjects) { return _this.saveOrDeleteObjects(remoteObjects, existingObjects, user, parentObject, refreshFiles); });
        }
        else {
            return ILIASObject.findByParentRefId(parentObject.refId, user.id)
                .then(function (existingObjects) { return _this.saveOrDeleteObjects(remoteObjects, existingObjects, user, parentObject, refreshFiles); });
        }
    };
    /**
     * @param remoteObjects
     * @param existingObjects
     * @param user
     * @param rootParent
     * @param refreshFiles
     * @returns {Promise<ILIASObject[]>}
     */
    DataProvider.prototype.saveOrDeleteObjects = function (remoteObjects, existingObjects, user, rootParent, refreshFiles) {
        var _this = this;
        if (refreshFiles === void 0) { refreshFiles = true; }
        var id = (rootParent) ? rootParent.refId.toString() : "-1";
        Profiler.addTimestamp("saveOrDeleteObjects-start", false, "PD/getObjectData", id);
        var iliasObjects = [];
        var promises = [];
        var objectsToDelete = existingObjects;
        Log.describe(this, "Existing Objects.", existingObjects);
        remoteObjects.forEach(function (remoteObject) {
            var promise = _this.storeILIASObject(remoteObject, user, rootParent, refreshFiles).then(function (iliasObject) {
                iliasObjects.push(iliasObject);
                // Check if the stored object exists already locally, if so, remove it from objectsToDelete
                var objectIndex = existingObjects.findIndex(function (existingObject) {
                    return existingObject.objId == iliasObject.objId;
                });
                if (objectIndex > -1) {
                    objectsToDelete.splice(objectIndex, 1);
                }
            });
            promises.push(promise);
        });
        return Promise.all(promises).then(function () {
            // TODO: build the following into the chain.
            // Delete all existing objects left that were not delivered
            objectsToDelete.forEach(function (iliasObject) {
                _this.deleteObject(iliasObject, user);
            });
            Profiler.addTimestamp("store-promise-done", false, "PD/getObjectData", id);
            return Promise.resolve(iliasObjects);
        });
    };
    /**
     * Deletes a given ILIAS Object from local DB
     * Note: This is fired async atm, we don't care about the result
     * @param iliasObject
     * @param user
     */
    DataProvider.prototype.deleteObject = function (iliasObject, user) {
        var _this = this;
        var promises = [];
        promises.push(iliasObject.destroy());
        if (iliasObject.type == "file") {
            promises.push(this.fileObjectHandler.onDelete(iliasObject, user));
        }
        // Container object must also delete their children
        if (iliasObject.isContainer()) {
            this.getObjectData(iliasObject, user, false, true).then(function (iliasObjects) {
                iliasObjects.forEach(function (iliasObject) {
                    promises.push(_this.deleteObject(iliasObject, user));
                });
            });
        }
        return Promise.all(promises);
    };
    DataProvider = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [ILIASRestProvider,
            DataProviderFileObjectHandler])
    ], DataProvider);
    return DataProvider;
}());
export { DataProvider };
//# sourceMappingURL=data-provider.provider.js.map