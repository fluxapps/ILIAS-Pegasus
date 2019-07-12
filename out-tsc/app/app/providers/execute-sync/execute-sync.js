var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/** angular */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ModalController } from "@ionic/angular";
/** services */
import { SynchronizationService } from "../../services/synchronization.service";
import { FooterToolbarService, Job } from "../../services/footer-toolbar.service";
import { Log } from "../../services/log.service";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { TranslateService } from "@ngx-translate/core";
import { SynchronizationPage } from "../../fallback/synchronization/synchronization.component";
/*
  Generated class for the ExecuteSyncProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var ExecuteSyncProvider = /** @class */ (function () {
    function ExecuteSyncProvider(http, sync, footerToolbar, translate, modal) {
        this.http = http;
        this.sync = sync;
        this.footerToolbar = footerToolbar;
        this.translate = translate;
        this.modal = modal;
        this.objects = [];
        this.log = Logging.getLogger(ExecuteSyncProvider_1.name);
        console.log("Hello ExecuteSyncProvider");
    }
    ExecuteSyncProvider_1 = ExecuteSyncProvider;
    ExecuteSyncProvider.prototype.executeSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var syncModal, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (SynchronizationService.state.recursiveSyncRunning) {
                            this.log.debug(function () { return "Unable to sync because sync is already running."; });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.displaySyncScreen()];
                    case 1:
                        syncModal = _a.sent();
                        Log.write(this, "Sync start", [], []);
                        this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
                        return [4 /*yield*/, this.sync.liveLoad()];
                    case 2:
                        _a.sent();
                        this.footerToolbar.removeJob(Job.Synchronize);
                        return [4 /*yield*/, this.hideSyncScreen(syncModal)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        Log.error(this, error_1);
                        this.footerToolbar.removeJob(Job.Synchronize);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ExecuteSyncProvider.prototype.displaySyncScreen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var syncModal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.objects.length)
                            return [2 /*return*/, undefined];
                        return [4 /*yield*/, this.modal.create({
                                component: SynchronizationPage,
                                componentProps: { "backdrop-dismiss": false }
                            })];
                    case 1:
                        syncModal = _a.sent();
                        return [4 /*yield*/, syncModal.present()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, syncModal];
                }
            });
        });
    };
    ExecuteSyncProvider.prototype.hideSyncScreen = function (syncModal) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!syncModal) return [3 /*break*/, 2];
                        return [4 /*yield*/, syncModal.dismiss()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    var ExecuteSyncProvider_1;
    ExecuteSyncProvider = ExecuteSyncProvider_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [HttpClient,
            SynchronizationService,
            FooterToolbarService,
            TranslateService,
            ModalController])
    ], ExecuteSyncProvider);
    return ExecuteSyncProvider;
}());
export { ExecuteSyncProvider };
//# sourceMappingURL=execute-sync.js.map