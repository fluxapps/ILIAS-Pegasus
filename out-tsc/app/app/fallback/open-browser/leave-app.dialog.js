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
import { ModalController, NavParams } from "@ionic/angular";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { TranslateService } from "@ngx-translate/core";
var LeaveAppDialog = /** @class */ (function () {
    function LeaveAppDialog(nav, modalCtrl, translate) {
        this.nav = nav;
        this.modalCtrl = modalCtrl;
        this.translate = translate;
        this.log = Logging.getLogger(LeaveAppDialog_1.name);
        this.params = nav.data;
    }
    LeaveAppDialog_1 = LeaveAppDialog;
    LeaveAppDialog.prototype.dismiss = function () {
        this.log.trace(function () { return "User action -> dismiss"; });
        this.modalCtrl.dismiss();
    };
    LeaveAppDialog.prototype.leaveApp = function () {
        this.log.trace(function () { return "User action -> leave app"; });
        var options = {
            location: "yes",
            clearcache: "yes",
            clearsessioncache: "yes"
        };
        this.params.leaveApp();
        this.modalCtrl.dismiss();
    };
    var LeaveAppDialog_1;
    LeaveAppDialog = LeaveAppDialog_1 = __decorate([
        Component({
            templateUrl: "leave-app.dialog.html"
        }),
        __metadata("design:paramtypes", [NavParams,
            ModalController,
            TranslateService])
    ], LeaveAppDialog);
    return LeaveAppDialog;
}());
export { LeaveAppDialog };
//# sourceMappingURL=leave-app.dialog.js.map