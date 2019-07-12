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
/** providers */
import { NEWS_REST } from "../../providers/ilias/news.rest";
import { USER_REPOSITORY } from "../../providers/repository/repository.user";
/** misc */
import { NewsEntity } from "../../entity/news.entity";
import { User } from "../../models/user";
export var NEWS_SYNCHRONIZATION = new InjectionToken("token for news service synchronization");
/**
 * The standard implementation of news service synchronization.
 * The synchronization is done over the ILIAS REST plugin.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
var NewsSynchronizationImpl = /** @class */ (function () {
    function NewsSynchronizationImpl(newsRest, userRepository) {
        this.newsRest = newsRest;
        this.userRepository = userRepository;
    }
    /**
     * Synchronize the personal ILIAS news of the current authenticated user.
     *
     * @returns {Promise<void>}
     */
    NewsSynchronizationImpl.prototype.synchronize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var news, mappedNews, activeUser, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.newsRest.getNews()];
                    case 1:
                        news = _a.sent();
                        mappedNews = news.map(this.mapToEntity);
                        return [4 /*yield*/, User.currentUser()];
                    case 2:
                        activeUser = _a.sent();
                        if (!(activeUser !== undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.userRepository.find(activeUser.id)];
                    case 3:
                        user = (_a.sent()).get();
                        user.news = mappedNews;
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    NewsSynchronizationImpl.prototype.mapToEntity = function (newsItem) {
        var entity = new NewsEntity();
        entity.newsId = newsItem.newsId;
        entity.newsContext = newsItem.newsContext;
        entity.title = newsItem.title;
        entity.subtitle = newsItem.subtitle;
        entity.content = newsItem.content;
        entity.createDate = newsItem.createDate;
        entity.updateDate = newsItem.updateDate;
        return entity;
    };
    NewsSynchronizationImpl = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(NEWS_REST)),
        __param(1, Inject(USER_REPOSITORY)),
        __metadata("design:paramtypes", [Object, Object])
    ], NewsSynchronizationImpl);
    return NewsSynchronizationImpl;
}());
export { NewsSynchronizationImpl };
//# sourceMappingURL=news.synchronization.js.map