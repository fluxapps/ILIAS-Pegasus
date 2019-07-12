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
/**
 * The definition of the news rest response.
 *
 * Response definition of /v2/ilias-app/news
 *
 * @author nschaefli <ns@studer-raimann.ch>
 *
 * @property {number} newsId      - The unique news identifier.
 * @property {number} newsContext - Ref id of the context object of the news object.
 * For example an uploaded file to within a course would have the course as context object.
 *
 * @property {string} title       - The title of the news.
 * @property {string} subtitle    - The subtitle of the news.
 * @property {string} content     - The content of the news.
 * @property {number} createDate  - The creation date of the news as unix epoch timestamp.
 * @property {number} updateDate  - The latest update date of the news as unix epoch timestamp.
 */
/** angular */
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { ILIAS_REST } from "./ilias.rest";
export var NEWS_REST = new InjectionToken("token for ILIAS news rest interface");
/**
 * The standard implementation of the news rest interface.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
var NewsRestImpl = /** @class */ (function () {
    function NewsRestImpl(rest) {
        this.rest = rest;
        this.REST_PATH = "/v2/ilias-app/news";
        this.log = Logging.getLogger("NewsRestImpl");
    }
    /**
     * Fetches all news of the actually authenticated user.
     *
     * Used rest route: /v2/ilias-app/news.
     *
     * @returns {Promise<Array<NewsItem>>}
     */
    NewsRestImpl.prototype.getNews = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.info(function () { return "Download news for authenticated user."; });
                        return [4 /*yield*/, this.rest.get(this.REST_PATH, {
                                accept: "application/json",
                            })];
                    case 1:
                        result = _a.sent();
                        this.log.info(function () { return "Handle news response"; });
                        return [2 /*return*/, result.handle(function (it) {
                                _this.log.info(function () { return "Validate news response"; });
                                return it.json(jsonSchema);
                            })];
                }
            });
        });
    };
    NewsRestImpl = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(ILIAS_REST)),
        __metadata("design:paramtypes", [Object])
    ], NewsRestImpl);
    return NewsRestImpl;
}());
export { NewsRestImpl };
/**
 * The json schema as described in the api blue blueprints.
 */
var jsonSchema = [{
        "title": "News",
        "type": "object",
        "properties": {
            "newsId": {
                "description": "The numeric news identifier.",
                "type": "integer",
                "minimum": 1
            },
            "newsContext": {
                "description": "The ref id of the news context.",
                "type": "integer",
                "minimum": 1
            },
            "title": {
                "description": "The title of the news entry.",
                "type": "string",
                "pattern": "^.{1,}$"
            },
            "content": {
                "description": "The content of the news entry.",
                "type": "string"
            },
            "subtitle": {
                "description": "The subtitle of the news entry",
                "type": "string"
            },
            "createDate": {
                "description": "The create date of the news entry as unix epoch time.",
                "type": "integer",
                "minimum": 1
            },
            "updateDate": {
                "description": "The update date of the news entry as unix epoch time.",
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["newsId", "newsContext", "title", "content", "subtitle", "createDate", "updateDate"]
    }];
//# sourceMappingURL=news.rest.js.map