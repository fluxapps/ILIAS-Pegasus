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
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
/** misc */
import { USER_REPOSITORY } from "../../providers/repository/repository.user";
import { User } from "../../models/user";
export var NEWS_FEED = new InjectionToken("token for news service -> news feed");
/**
 * The news model which holds the data required to
 * display the news.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
var NewsItemModel = /** @class */ (function () {
    function NewsItemModel(newsId, newsContext, title, subtitle, content, createDate, updateDate) {
        if (subtitle === void 0) { subtitle = ""; }
        if (content === void 0) { content = ""; }
        if (createDate === void 0) { createDate = new Date(Date.now()); }
        if (updateDate === void 0) { updateDate = new Date(Date.now()); }
        this.newsId = newsId;
        this.newsContext = newsContext;
        this.title = title;
        this.subtitle = subtitle;
        this.content = content;
        this.createDate = createDate;
        this.updateDate = updateDate;
    }
    return NewsItemModel;
}());
export { NewsItemModel };
/**
 * The standard news feed implementation which loads the
 * preloaded news over the standard database connection.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
var NewsFeedImpl = /** @class */ (function () {
    function NewsFeedImpl(sanitizer, userRepository) {
        this.sanitizer = sanitizer;
        this.userRepository = userRepository;
    }
    NewsFeedImpl_1 = NewsFeedImpl;
    NewsFeedImpl.prototype.fetchAllForCurrentUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeUser, user, mapToModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.findActiveUser()];
                    case 1:
                        activeUser = _a.sent();
                        return [4 /*yield*/, this.userRepository.find(activeUser.id)];
                    case 2:
                        user = (_a.sent()).get();
                        mapToModel = this.mapToModel.bind(this);
                        return [2 /*return*/, user.news.map(mapToModel)];
                }
            });
        });
    };
    NewsFeedImpl.prototype.mapToModel = function (entity) {
        return new NewsItemModel(entity.newsId, entity.newsContext, entity.title, entity.subtitle, this.sanitizer.bypassSecurityTrustHtml(entity.content), new Date(entity.createDate * NewsFeedImpl_1.UNIX_TIME_MULTIPLIER_MILIS), new Date(entity.updateDate * NewsFeedImpl_1.UNIX_TIME_MULTIPLIER_MILIS));
    };
    var NewsFeedImpl_1;
    NewsFeedImpl.UNIX_TIME_MULTIPLIER_MILIS = 1000;
    NewsFeedImpl = NewsFeedImpl_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(1, Inject(USER_REPOSITORY)),
        __metadata("design:paramtypes", [DomSanitizer, Object])
    ], NewsFeedImpl);
    return NewsFeedImpl;
}());
export { NewsFeedImpl };
//# sourceMappingURL=news.feed.js.map