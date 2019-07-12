/** services */
import { ILIASAppUtils } from "../services/ilias-app-utils.service";
import { FileService } from "../services/file.service";
/** logging */
import { Log } from "../services/log.service";
/** misc */
import { ILIASObject } from "../models/ilias-object";
/**
 * A generic presenter if the object type does not match a more specific one, e.g. CourseObjectPresenter
 */
var GenericILIASObjectPresenter = /** @class */ (function () {
    function GenericILIASObjectPresenter(iliasObject) {
        this.iliasObject = iliasObject;
    }
    GenericILIASObjectPresenter.prototype.icon = function () {
        return "assets/icon/obj_link.svg";
    };
    GenericILIASObjectPresenter.prototype.title = function () {
        return this.iliasObject.title;
    };
    GenericILIASObjectPresenter.prototype.typeLangVar = function () {
        return "object_type." + this.iliasObject.type;
    };
    GenericILIASObjectPresenter.prototype.showTypeAsText = function () {
        return true;
    };
    GenericILIASObjectPresenter.prototype.details = function () {
        var _this = this;
        // let details = [{label: 'details.last_update', value: this.iliasObject.updatedAt ? this.iliasObject.updatedAt : this.iliasObject.createdAt}];
        var details = [];
        if (this.iliasObject.isContainer() && !this.iliasObject.isLinked()) {
            var detailPromises = [];
            // Container objects display the used disk space of file items below
            detailPromises.push(FileService.calculateDiskSpace(this.iliasObject)
                .then(function (diskSpace) {
                Log.describe(_this, "Disk space used: ", ILIASAppUtils.formatSize(diskSpace));
                var detail = { label: "details.used_disk_space", value: ILIASAppUtils.formatSize(diskSpace) };
                details.push(detail);
                return Promise.resolve(detail);
            }));
            // And the potentially used diskspace
            detailPromises.push(FileService.calculateDiskSpace(this.iliasObject, false)
                .then(function (diskSpace) {
                Log.describe(_this, "Potentially used disk space: ", ILIASAppUtils.formatSize(diskSpace));
                var detail = { label: "details.potentially_used_disk_space", value: ILIASAppUtils.formatSize(diskSpace) };
                details.push(detail);
                return Promise.resolve(detail);
            }));
            detailPromises.push(Promise.resolve({ label: "details.offline_available", value: this.iliasObject.isOfflineAvailable ? "yes" : "no", translate: true }));
            return Promise.all(detailPromises);
        }
        else {
            return Promise.resolve(details);
        }
    };
    GenericILIASObjectPresenter.prototype.metaBadges = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var badges = [];
            if (_this.iliasObject.isNew) {
                badges.push({ value: "New", color: "primary" });
            }
            if (_this.iliasObject.isUpdated) {
                badges.push({ value: "Updated", color: "primary" });
            }
            // Container display the number of new objects of their children
            if (_this.iliasObject.isContainer()) {
                ILIASObject.findByParentRefIdRecursive(_this.iliasObject.refId, _this.iliasObject.userId).then(function (iliasObjects) {
                    var newObjects = iliasObjects.filter(function (iliasObject) {
                        return iliasObject.isNew;
                    });
                    var n = newObjects.length;
                    if (n) {
                        badges.push({ value: n, color: "primary" });
                    }
                    resolve(badges);
                });
            }
            else {
                resolve(badges);
            }
        });
    };
    GenericILIASObjectPresenter.prototype.metaIcons = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var icons = [];
            if (_this.iliasObject.isFavorite) {
                icons.push({ name: "star", color: "" });
            }
            resolve(icons);
        });
    };
    return GenericILIASObjectPresenter;
}());
export { GenericILIASObjectPresenter };
//# sourceMappingURL=object-presenter.js.map