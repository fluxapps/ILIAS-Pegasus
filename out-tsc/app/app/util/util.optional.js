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
import { isNullOrUndefined } from "util";
import { isDefined } from "./util.function";
import { NoSuchElementError } from "../error/errors";
/**
 * A container object which may or may not contain a non-null | non-undefined value.
 * If a value is present, {@code isPresent()} will return true and {@code get()} will return the value.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var Optional = /** @class */ (function () {
    function Optional(value) {
        this.value = value;
    }
    /**
     * @returns {Optional<T>} an empty optional instance
     */
    Optional.empty = function () { return new Optional(undefined); };
    /**
     * Returns an {@code Optional} with the specific non-null | non-undefined value.
     * If the given {@code value} is null or undefined, this method throws a {@link TypeError}.
     *
     * @param {T} value - non-null | non-undefined value to create the optional
     *
     * @returns {Optional<T>} the resulting {@code Optional}
     */
    Optional.of = function (value) {
        if (isNullOrUndefined(value)) {
            throw new TypeError("the given parameter 'value' must not be null or undefined.");
        }
        return new Optional(value);
    };
    /**
     * Returns an {@code Optional} describing the specified value, if non-null / non-undefined, otherwise returns an empty optional.
     *
     * @param {T | null | undefined} value - the possibly null / undefined value
     *
     * @returns {Optional<T>} the resulting {@code Optional}
     */
    Optional.ofNullable = function (value) {
        if (isNullOrUndefined(value)) {
            return Optional.empty();
        }
        return Optional.of(value);
    };
    /**
     * If a value is present in this {@code Optional}, returns the value, otherwise throws {@link NoSuchElementError}.
     *
     * @returns {T} the value if present
     */
    Optional.prototype.get = function () {
        if (!isDefined(this.value)) {
            throw new NoSuchElementError("Value is not present.");
        }
        return this.value;
    };
    /**
     * If a value is present, invoke the specified {@code consumer} with the value, otherwise do nothing.
     *
     * @param {(value: T) => void} consumer - lambda to invoke with the value
     */
    Optional.prototype.ifPresent = function (consumer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isDefined(this.value)) return [3 /*break*/, 2];
                        return [4 /*yield*/, consumer(this.value)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @returns {boolean} true if there is a value present, otherwise false
     */
    Optional.prototype.isPresent = function () { return isDefined(this.value); };
    /**
     * Returns the value if present, otherwise returns {@code other}.
     *
     * @param {T} other - value to returns on non-present value
     *
     * @returns {T} the resulting value
     */
    Optional.prototype.orElse = function (other) {
        if (!isDefined(this.value)) {
            return other;
        }
        return this.value;
    };
    /**
     * Returns the value if present, otherwise returns the value given by the {@code other} supplier.
     *
     * @param {() => Promise<T>} other - supplier for the value to return on non-present value
     *
     * @returns {Promise<T>} the resulting value
     */
    Optional.prototype.orElseGet = function (other) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!isDefined(this.value)) {
                    return [2 /*return*/, other()];
                }
                return [2 /*return*/, this.value];
            });
        });
    };
    /**
     * Returns the value if present, otherwise throws the error given by the {@code errorSupplier}.
     *
     * @param {() => Error} errorSupplier - supplier for the error tho throw on non-present value
     *
     * @returns {T} the value of present
     */
    Optional.prototype.orElseThrow = function (errorSupplier) {
        if (!isDefined(this.value)) {
            throw errorSupplier();
        }
        return this.value;
    };
    return Optional;
}());
export { Optional };
//# sourceMappingURL=util.optional.js.map