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
import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
/** ionic-native */
import { File } from "@ionic-native/file/ngx";
/** ilias */
import { OAUTH2_DATA_SUPPLIER } from "./ilias/ilias.rest-api";
import { ILIAS_REST, TOKEN_MANAGER } from "./ilias/ilias.rest";
import { Logging } from "../services/logging/logging.service";
/** misc */
import { FILE_DOWNLOADER } from "./file-transfer/file-download";
import { Profiler } from "../util/profiler";
var DEFAULT_OPTIONS = { accept: "application/json" };
var ILIASRestProvider = /** @class */ (function () {
    function ILIASRestProvider(http, iliasRest, donwloader, dataSupplier, tokenManager, file) {
        this.http = http;
        this.iliasRest = iliasRest;
        this.donwloader = donwloader;
        this.dataSupplier = dataSupplier;
        this.tokenManager = tokenManager;
        this.file = file;
        this.log = Logging.getLogger(ILIASRestProvider_1.name);
    }
    ILIASRestProvider_1 = ILIASRestProvider;
    ILIASRestProvider.prototype.getAuthToken = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.iliasRest.get("/v2/ilias-app/auth-token", DEFAULT_OPTIONS)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.handle(function (it) {
                                return it.json(authTokenSchema).token;
                            })];
                }
            });
        });
    };
    ILIASRestProvider.prototype.getDesktopData = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.iliasRest.get("/v2/ilias-app/desktop", DEFAULT_OPTIONS)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.handle(function (it) {
                                return it.json(desktopDataSchema);
                            })];
                }
            });
        });
    };
    ILIASRestProvider.prototype.getObjectData = function (parentRefId, user, recursive, timeout) {
        if (recursive === void 0) { recursive = false; }
        if (timeout === void 0) { timeout = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var opt, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opt = (recursive) ? { accept: "application/json", urlParams: [["recursive", "1"]] } : DEFAULT_OPTIONS;
                        return [4 /*yield*/, this.iliasRest.get("/v2/ilias-app/objects/" + parentRefId, opt)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.handle(function (it) {
                                return it.json(desktopDataSchema);
                            })];
                }
            });
        });
    };
    ILIASRestProvider.prototype.getFileData = function (refId, user, timeout) {
        if (timeout === void 0) { timeout = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Profiler.addTimestamp("", true, "REST/getFileData", refId.toString());
                        return [4 /*yield*/, this.iliasRest.get("/v2/ilias-app/files/" + refId, DEFAULT_OPTIONS)];
                    case 1:
                        response = _a.sent();
                        Profiler.addTimestamp("iliasRest.get-done", false, "REST/getFileData", refId.toString());
                        return [2 /*return*/, response.handle(function (it) {
                                return it.json(fileShema);
                            })];
                }
            });
        });
    };
    ILIASRestProvider.prototype.downloadFile = function (refId, storageLocation, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            var credentials, url, header, _a, _b, filePath, downloadOptions, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.dataSupplier.getClientCredentials()];
                    case 1:
                        credentials = _e.sent();
                        url = credentials.apiURL + "/v1/files/" + refId;
                        _a = {};
                        _b = credentials.token.type + " ";
                        return [4 /*yield*/, this.tokenManager.getAccessToken()];
                    case 2:
                        header = (_a.Authorization = _b + (_e.sent()),
                            _a);
                        filePath = "" + storageLocation + fileName;
                        downloadOptions = {
                            url: url,
                            filePath: filePath,
                            body: "",
                            followRedirects: true,
                            headers: header,
                            timeout: 0
                        };
                        return [4 /*yield*/, this.donwloader.download(downloadOptions)];
                    case 3:
                        _e.sent();
                        _d = (_c = this.file).getFile;
                        return [4 /*yield*/, this.file.resolveDirectoryUrl(storageLocation)];
                    case 4: return [2 /*return*/, _d.apply(_c, [_e.sent(), fileName, {
                                create: false,
                                exclusive: false
                            }])];
                }
            });
        });
    };
    var ILIASRestProvider_1;
    ILIASRestProvider = ILIASRestProvider_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(1, Inject(ILIAS_REST)),
        __param(2, Inject(FILE_DOWNLOADER)),
        __param(3, Inject(OAUTH2_DATA_SUPPLIER)),
        __param(4, Inject(TOKEN_MANAGER)),
        __metadata("design:paramtypes", [HttpClient, Object, Object, Object, Object, File])
    ], ILIASRestProvider);
    return ILIASRestProvider;
}());
export { ILIASRestProvider };
var authTokenSchema = {
    "title": "auth-token",
    "type": "object",
    "properties": {
        "token": {
            "type": "string",
        },
        "required": ["token"]
    }
};
//TODO: make description/items/title properties not nullable. Check null in Rest plugin.
var desktopDataSchema = {
    "title": "desktop-data",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "objId": { "type": "string" },
            "title": { "type": ["string", "null"] },
            "description": { "type": ["string", "null"] },
            "hasPageLayout": { "type": "boolean" },
            "hasTimeline": { "type": "boolean" },
            "permissionType": { "type": "string" },
            "refId": { "type": "string" },
            "parentRefId": { "type": "string" },
            "type": { "type": "string" },
            "link": { "type": "string" },
            "repoPath": {
                "type": "array",
                "items": {
                    "type": ["string", "null"]
                }
            }
        },
        "required": ["objId", "title", "description", "hasPageLayout", "hasTimeline",
            "permissionType", "refId", "parentRefId", "type", "link", "repoPath"]
    }
};
var fileShema = {
    "title": "file-data",
    "type": "object",
    "properties": {
        "fileExtension": { "type": "string" },
        "fileName": { "type": "string" },
        "fileSize": { "type": "string" },
        "fileType": { "type": "string" },
        "fileVersion": { "type": "string" },
        "fileVersionDate": { "type": "string" }
    },
    "required": ["fileExtension", "fileName", "fileSize", "fileType", "fileVersion", "fileVersionDate"]
};
//# sourceMappingURL=ilias-rest.provider.js.map