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
import { HttpResponse as Response } from "@angular/common/http";
import { InjectionToken, Injectable } from "@angular/core";
/** ionic-native */
import { HTTP } from "@ionic-native/http/ngx";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { HttpRequestError, HttpResponse } from "../http";
export var FILE_UPLOADER = new InjectionToken("token for file uploader");
/**
 * Standard file download implementation.
 */
var FileUploaderImpl = /** @class */ (function () {
    function FileUploaderImpl(http) {
        this.http = http;
        this.log = Logging.getLogger(FileUploaderImpl_1.name);
        this.requestCounter = 0;
    }
    FileUploaderImpl_1 = FileUploaderImpl;
    /**
     * Uploads the given file to the specified url.
     *
     * @param {UploadRequestOptions} options
     * @returns {Promise<HttpResponse>}
     *
     * @throws {HttpRequestError} Thrown if the upload of the resource failed.
     */
    FileUploaderImpl.prototype.upload = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId_1, response, rawResponse, bodyBuffer, bodyView, i, charCode, error_1, response_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        requestId_1 = this.generateRequestId();
                        this.log.trace(function () { return "Upload-" + requestId_1 + ": Clear cookies for request."; });
                        this.http.clearCookies();
                        this.log.trace(function () { return "Upload-" + requestId_1 + ": Redirects enabled: " + options.followRedirects; });
                        this.http.disableRedirect(!options.followRedirects);
                        return [4 /*yield*/, this.http.uploadFile(options.url, "", options.headers, options.filePath, options.name)];
                    case 1:
                        response = (_a.sent());
                        this.log.trace(function () { return "Upload-" + requestId_1 + ": Transfer finished."; });
                        rawResponse = (typeof (response.data) === "string") ? response.data.toString() : "";
                        bodyBuffer = new ArrayBuffer(rawResponse.length);
                        bodyView = new DataView(bodyBuffer);
                        for (i = 0; i < rawResponse.length; i++) {
                            charCode = rawResponse.charCodeAt(i);
                            bodyView.setInt8(i, charCode);
                        }
                        return [2 /*return*/, new HttpResponse(new Response({
                                url: response.url,
                                status: response.status,
                                statusText: "",
                                body: bodyBuffer,
                                headers: response.headers
                            }))];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1.hasOwnProperty("error")) {
                            response_1 = error_1;
                            this.log.warn(function () { return "Request to \"" + response_1.url + "\" failed with status code: " + response_1.status + " error: " + response_1.error; });
                            throw new HttpRequestError(response_1.status, "Request to \"" + response_1.url + "\" failed with error: " + response_1.error);
                        }
                        this.log.warn(function () { return "The resource upload failed with error: " + JSON.stringify(error_1); });
                        throw new HttpRequestError(0, "The resource upload failed with error: " + JSON.stringify(error_1));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates the request id which is used to distinguish the logs of the different running requests.
     * This method is save integer overflow aware.
     *
     * @returns {number} The request id of the current request.
     */
    FileUploaderImpl.prototype.generateRequestId = function () {
        if (this.requestCounter === Number.MAX_SAFE_INTEGER)
            this.requestCounter = 0;
        return ++this.requestCounter;
    };
    var FileUploaderImpl_1;
    FileUploaderImpl = FileUploaderImpl_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [HTTP])
    ], FileUploaderImpl);
    return FileUploaderImpl;
}());
export { FileUploaderImpl };
//# sourceMappingURL=file-upload.js.map