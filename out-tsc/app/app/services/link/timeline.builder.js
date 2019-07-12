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
import { INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER } from "./link-builder.supplier";
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { USER_REPOSITORY } from "../../providers/repository/repository.user";
import { IllegalStateError, NoSuchElementError } from "../../error/errors";
export var TIMELINE_LINK_BUILDER = new InjectionToken("token for timeline link builder factory");
/**
 * The time-line link builder, creates a link to an arbitrary ILIAS time-line enabled container object, for example a course.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
var TimelineLinkBuilderImpl = /** @class */ (function () {
    function TimelineLinkBuilderImpl(installationLinkSupplier, tokenSupplier, userRepository) {
        this.installationLinkSupplier = installationLinkSupplier;
        this.tokenSupplier = tokenSupplier;
        this.userRepository = userRepository;
        this.refId = -1;
    }
    /**
     * Set the ILIAS link target ref id.
     *
     * @param {number} refId
     * @returns {TimelineLinkBuilder}
     */
    TimelineLinkBuilderImpl.prototype.target = function (refId) {
        this.refId = refId;
        return this;
    };
    /**
     * Build the timeline ILIAS link.
     *
     * @returns {Promise<string>} The ILIAS timeline link.
     *
     * @throws IllegalStateError  Thrown if the builder is not ready to build the link.
     */
    TimelineLinkBuilderImpl.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, token, installation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.validateBuilderState();
                        return [4 /*yield*/, this.userRepository.findAuthenticatedUser()];
                    case 1:
                        user = (_a.sent())
                            .orElseThrow(function () { return new NoSuchElementError("No authenticated user found, unable to build timeline ILIAS link."); });
                        return [4 /*yield*/, this.tokenSupplier.get()];
                    case 2:
                        token = _a.sent();
                        return [4 /*yield*/, this.installationLinkSupplier.get()];
                    case 3:
                        installation = _a.sent();
                        return [2 /*return*/, installation + "/goto.php?target=ilias_app_auth|" + user.iliasUserId + "|" + this.refId + "|timeline|" + token];
                }
            });
        });
    };
    /**
     * Validates the state of the builder.
     * If the builder is not ready for the build state
     * an error will be thrown.
     */
    TimelineLinkBuilderImpl.prototype.validateBuilderState = function () {
        if (this.refId <= 0)
            throw new IllegalStateError("Required ref id was not found, ILIAS timeline link build failed.");
    };
    TimelineLinkBuilderImpl = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(INSTALLATION_LINK_PROVIDER)),
        __param(1, Inject(TOKEN_SUPPLIER)),
        __param(2, Inject(USER_REPOSITORY)),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], TimelineLinkBuilderImpl);
    return TimelineLinkBuilderImpl;
}());
export { TimelineLinkBuilderImpl };
//# sourceMappingURL=timeline.builder.js.map