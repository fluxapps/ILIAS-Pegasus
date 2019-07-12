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
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER } from "./link-builder.supplier";
import { USER_REPOSITORY } from "../../providers/repository/repository.user";
import { IllegalStateError, NoSuchElementError } from "../../error/errors";
/** logging */
import { Logging } from "../logging/logging.service";
export var NEWS_LINK_BUILDER = new InjectionToken("token for news link builder factory");
var NewsLinkBuilderImpl = /** @class */ (function () {
    function NewsLinkBuilderImpl(installationLinkSupplier, tokenSupplier, userRepository) {
        this.installationLinkSupplier = installationLinkSupplier;
        this.tokenSupplier = tokenSupplier;
        this.userRepository = userRepository;
        this.log = Logging.getLogger(NewsLinkBuilderImpl_1.name);
        this.id = -1;
        this.contextId = -1;
    }
    NewsLinkBuilderImpl_1 = NewsLinkBuilderImpl;
    /**
     * Sets the news identifier which is used to link to the correct news article.
     *
     * @param {number} id         The identifier of the news item the link should point to.
     *
     * @returns {NewsLinkBuilder} The link builder it self for fluent chaining.
     */
    NewsLinkBuilderImpl.prototype.newsId = function (id) {
        this.id = id;
        return this;
    };
    /**
     * The context id of the news which should be displayed.
     * This is a ref id used by ILIAS to show the context of the news, for example
     * for forum entry news items the context would be the ref id of the form it self.
     *
     * @param {number} context        The news context identifier.
     *
     * @returns {NewsLinkBuilder}     The link builder it self for fluent chaining.
     */
    NewsLinkBuilderImpl.prototype.context = function (context) {
        this.contextId = context;
        return this;
    };
    /**
     * Builds the news token with a ready to use auth token.
     *
     * @returns {Promise<string>} The build news url.
     */
    NewsLinkBuilderImpl.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, token, installation;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.validateBuilderState();
                        this.log.debug(function () { return JSON.stringify(_this.userRepository); });
                        return [4 /*yield*/, this.userRepository.findAuthenticatedUser()];
                    case 1:
                        user = (_a.sent())
                            .orElseThrow(function () { return new NoSuchElementError("No authenticated user found, unable to build news ILIAS link."); });
                        return [4 /*yield*/, this.tokenSupplier.get()];
                    case 2:
                        token = _a.sent();
                        return [4 /*yield*/, this.installationLinkSupplier.get()];
                    case 3:
                        installation = _a.sent();
                        return [2 /*return*/, installation + "/goto.php?target=ilias_app_news|" + user.iliasUserId + "|" + this.id + "|" + this.contextId + "|" + token];
                }
            });
        });
    };
    /**
     * Validates the state of the builder.
     * If the builder is not ready for the build state
     * an error will be thrown.
     */
    NewsLinkBuilderImpl.prototype.validateBuilderState = function () {
        if (this.id <= 0)
            throw new IllegalStateError("Required news id was not found, ILIAS news link build failed.");
        if (this.contextId <= 0)
            throw new IllegalStateError("Required news context id was not found, ILIAS news link build failed.");
    };
    var NewsLinkBuilderImpl_1;
    NewsLinkBuilderImpl = NewsLinkBuilderImpl_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(INSTALLATION_LINK_PROVIDER)),
        __param(1, Inject(TOKEN_SUPPLIER)),
        __param(2, Inject(USER_REPOSITORY)),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], NewsLinkBuilderImpl);
    return NewsLinkBuilderImpl;
}());
export { NewsLinkBuilderImpl };
//# sourceMappingURL=news.builder.js.map