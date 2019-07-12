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
import { Logging } from "./logging/logging.service";
var FooterToolbarService = /** @class */ (function () {
    function FooterToolbarService() {
        this.log = Logging.getLogger(FooterToolbarService_1.name);
        this.offline = false;
        this._isLoading = false;
        this._loadingText = "";
        this.jobs = [];
    }
    FooterToolbarService_1 = FooterToolbarService;
    Object.defineProperty(FooterToolbarService.prototype, "isLoading", {
        get: function () {
            return this._isLoading;
        },
        enumerable: true,
        configurable: true
    });
    FooterToolbarService.prototype.addJob = function (id, text) {
        this.spliceId(id);
        this.jobs.push({ id: id, text: text });
        this.updateLoading();
    };
    FooterToolbarService.prototype.removeJob = function (id) {
        this.spliceId(id);
        this.updateLoading();
    };
    /**
     * this method removes all occurences of the job with id.
     * @param id
     */
    FooterToolbarService.prototype.spliceId = function (id) {
        for (var key in this.jobs) {
            if (this.jobs[key].id == id) {
                this.jobs.splice(key, 1);
            }
        }
    };
    ;
    FooterToolbarService.prototype.updateLoading = function () {
        var _this = this;
        var jobs = this.countJobs();
        this.log.debug(function () { return "number of jobs running: " + jobs; });
        this.log.debug(function () { return "Currently running jobs: " + _this.jobs; });
        if (jobs > 0) {
            this._isLoading = true;
            this._loadingText = this.getCurrentText();
        }
        else {
            this._isLoading = false;
            this._loadingText = "";
        }
    };
    FooterToolbarService.prototype.getCurrentText = function () {
        // with the slice we make sure the last element is not popped from the original array.
        if (this.jobs.slice(-1).pop()) {
            var job = this.jobs.slice(-1).pop();
            return job.text;
        }
        else
            return "";
    };
    FooterToolbarService.prototype.countJobs = function () {
        return this.jobs.length;
    };
    Object.defineProperty(FooterToolbarService.prototype, "loadingText", {
        get: function () {
            return this._loadingText;
        },
        enumerable: true,
        configurable: true
    });
    var FooterToolbarService_1;
    FooterToolbarService = FooterToolbarService_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [])
    ], FooterToolbarService);
    return FooterToolbarService;
}());
export { FooterToolbarService };
// Positive Ids are reserved for Jobs that have an ID related to the ILIAS object id.
export var Job;
(function (Job) {
    Job[Job["DeleteFilesTree"] = -1] = "DeleteFilesTree";
    Job[Job["MarkFiles"] = -2] = "MarkFiles";
    Job[Job["FileDownload"] = -3] = "FileDownload";
    Job[Job["Synchronize"] = -4] = "Synchronize";
    Job[Job["DeleteFilesSettings"] = -5] = "DeleteFilesSettings";
    Job[Job["DesktopAction"] = -6] = "DesktopAction";
    Job[Job["LoadFavorites"] = -7] = "LoadFavorites";
    Job[Job["LoadNewObjects"] = -8] = "LoadNewObjects";
    Job[Job["MetaDataFetch"] = -1] = "MetaDataFetch";
})(Job || (Job = {}));
//# sourceMappingURL=footer-toolbar.service.js.map