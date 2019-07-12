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
import { Component } from "@angular/core";
import { NavParams, ModalController } from "@ionic/angular";
/** misc */
import { TranslateService } from "@ngx-translate/core";
import { LeftOutReason } from "../../services/synchronization.service";
var SyncFinishedModal = /** @class */ (function () {
    /**
     * @param params
     * @param translate
     *
     * @param modalCtrl
     */
    function SyncFinishedModal(params, translate, modalCtrl) {
        var _this = this;
        this.translate = translate;
        this.modalCtrl = modalCtrl;
        this.title = "";
        var syncResult = params.get("syncResult");
        this.title = this.translate.instant("sync.title");
        this.totalItems = syncResult.totalObjects.length;
        this.updated = syncResult.objectsDownloaded.length;
        this.uptodate = syncResult.objectsUnchanged.length;
        this.tooBigs = [];
        syncResult.objectsLeftOut.forEach(function (item) {
            if (item.reason == LeftOutReason.FileTooBig) {
                _this.tooBigs.push(_this.getPathToObject(item.object));
            }
        });
        this.noMoreSpace = [];
        syncResult.objectsLeftOut.forEach(function (item) {
            if (item.reason == LeftOutReason.QuotaExceeded) {
                _this.noMoreSpace.push(_this.getPathToObject(item.object));
            }
        });
    }
    SyncFinishedModal.prototype.closeModal = function () {
        this.modalCtrl.dismiss();
    };
    SyncFinishedModal.prototype.getPathToObject = function (object) {
        return object.getParentsTitleChain()
            .then(function (parentTitles) { return parentTitles.join("/"); });
    };
    SyncFinishedModal = __decorate([
        Component({
            templateUrl: "sync-finished-modal.html",
        }),
        __metadata("design:paramtypes", [NavParams,
            TranslateService,
            ModalController])
    ], SyncFinishedModal);
    return SyncFinishedModal;
}());
export { SyncFinishedModal };
//# sourceMappingURL=sync-finished-modal.js.map