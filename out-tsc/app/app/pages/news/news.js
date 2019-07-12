var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
import { Component, Inject } from "@angular/core";
import { ModalController } from "@ionic/angular";
/** models */
import { ILIASObject } from "../../models/ilias-object";
import { User } from "../../models/user";
import { FooterToolbarService, Job } from "../../services/footer-toolbar.service";
import { LINK_BUILDER } from "../../services/link/link-builder.service";
import { NEWS_FEED } from "../../services/news/news.feed";
import { SynchronizationService } from "../../services/synchronization.service";
import { OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY } from "../../actions/open-object-in-ilias-action";
import { Logging } from "../../services/logging/logging.service";
import { TranslateService } from "@ngx-translate/core";
/**
 * Generated class for the NewsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
var NewsPage = /** @class */ (function () {
    function NewsPage(newsFeed, translate, sync, footerToolbar, modal, openInIliasActionFactory, linkBuilder) {
        this.newsFeed = newsFeed;
        this.translate = translate;
        this.sync = sync;
        this.footerToolbar = footerToolbar;
        this.modal = modal;
        this.openInIliasActionFactory = openInIliasActionFactory;
        this.linkBuilder = linkBuilder;
        this.log = Logging.getLogger(NewsPage_1.name);
    }
    NewsPage_1 = NewsPage;
    NewsPage.prototype.ionViewWillEnter = function () {
        this.startNewsSync();
        this.log.debug(function () { return "News view initialized."; });
        this.reloadView();
    };
    // ngOnInit(): void {
    //     this.log.debug(() => "News view initialized.");
    //     this.reloadView();
    // }
    NewsPage.prototype.openNews = function (id, context) {
        this.log.debug(function () { return "open news with id " + id + ", context id " + context; });
        var action = this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.news().newsId(id).context(context));
        this.executeAction(action);
    };
    /**
     * called by pull-to-refresh refresher
     */
    NewsPage.prototype.startNewsSync = function (event) {
        if (event === void 0) { event = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 2, 3]);
                        return [4 /*yield*/, this.executeNewsSync()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        if (event)
                            event.target.complete();
                        this.reloadView();
                        return [7 /*endfinally*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    NewsPage.prototype.reloadView = function () {
        var _this = this;
        this.fetchPresenterNewsTuples().then(function (newsPresenterItems) { _this.newsPresenters = newsPresenterItems; });
    };
    // ------------------- object-list duplicate ----------------------------
    NewsPage.prototype.executeAction = function (action) {
        var _this = this;
        var hash = action.instanceId();
        this.footerToolbar.addJob(hash, "");
        action.execute().then(function () {
            _this.footerToolbar.removeJob(hash);
        }).catch(function (error) {
            _this.log.error(function () { return "action failed with message: " + error; });
            _this.footerToolbar.removeJob(hash);
            throw error;
        });
    };
    /**
     * executes news sync
     *
     * @returns {Promise<void>}
     */
    NewsPage.prototype.executeNewsSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (SynchronizationService.state.recursiveSyncRunning) {
                            this.log.debug(function () { return "Sync is already running."; });
                            return [2 /*return*/];
                        }
                        this.log.info(function () { return "Sync start"; });
                        this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
                        return [4 /*yield*/, this.sync.executeNewsSync()];
                    case 1:
                        _a.sent();
                        //maybe some objects came in new.
                        this.footerToolbar.removeJob(Job.Synchronize);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.log.error(function () { return "Error occured in sync implemented in news page. Error: " + error_1; });
                        this.footerToolbar.removeJob(Job.Synchronize);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    NewsPage.prototype.fetchPresenterByRefId = function (refId) {
        return __awaiter(this, void 0, void 0, function () {
            var userId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.currentUser()];
                    case 1:
                        userId = (_a.sent()).id;
                        return [4 /*yield*/, ILIASObject.findByRefId(refId, userId)];
                    case 2: return [2 /*return*/, (_a.sent()).presenter];
                }
            });
        });
    };
    NewsPage.prototype.fetchPresenterNewsTuples = function () {
        return __awaiter(this, void 0, void 0, function () {
            var news, mappedNews, _i, news_1, newsItem, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.newsFeed.fetchAllForCurrentUser()];
                    case 1:
                        news = _d.sent();
                        mappedNews = [];
                        _i = 0, news_1 = news;
                        _d.label = 2;
                    case 2:
                        if (!(_i < news_1.length)) return [3 /*break*/, 5];
                        newsItem = news_1[_i];
                        _b = (_a = mappedNews).push;
                        _c = [newsItem];
                        return [4 /*yield*/, this.fetchPresenterByRefId(newsItem.newsContext)];
                    case 3:
                        _b.apply(_a, [_c.concat([_d.sent()])]);
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        mappedNews.sort(function (a, b) {
                            return b[0].updateDate.getTime() - a[0].updateDate.getTime();
                        });
                        return [2 /*return*/, mappedNews];
                }
            });
        });
    };
    var NewsPage_1;
    NewsPage = NewsPage_1 = __decorate([
        Component({
            selector: "newsPresenters",
            templateUrl: "news.html"
        }),
        __param(0, Inject(NEWS_FEED)),
        __param(5, Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)),
        __param(6, Inject(LINK_BUILDER)),
        __metadata("design:paramtypes", [Object, TranslateService,
            SynchronizationService,
            FooterToolbarService,
            ModalController, Function, Object])
    ], NewsPage);
    return NewsPage;
}());
export { NewsPage };
//# sourceMappingURL=news.js.map