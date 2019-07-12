var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
/** services */
import { DEFAULT_CONNECTION_NAME } from "../../services/database/database.api";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { getConnection } from "typeorm";
import { Optional } from "../../util/util.optional";
/**
 * Generic implementation of a {@link CRUDRepository}.
 * Extend this class to have an implementation for the CRUD repository
 * on your specific repository.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.1.0
 */
var AbstractCRUDRepository = /** @class */ (function () {
    function AbstractCRUDRepository(database, connectionName) {
        if (connectionName === void 0) { connectionName = DEFAULT_CONNECTION_NAME; }
        this.database = database;
        this.connectionName = connectionName;
        this.log = Logging.getLogger(AbstractCRUDRepository.name);
    }
    Object.defineProperty(AbstractCRUDRepository.prototype, "connection", {
        get: function () {
            return getConnection(this.connectionName);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Saves the given {@code entity} and returns the stored entity.
     * Property changes during the save process are updated in the returned entity. e.g. primary key generation
     *
     * The entity will be saved by TypeORM.
     *
     * @param {T} entity - the entity to save
     *
     * @returns {Promise<T>} - the resulting entity
     * @throws {RepositoryError} if an error occurs during this operation
     */
    AbstractCRUDRepository.prototype.save = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database.ready(this.connectionName)];
                    case 1:
                        _a.sent();
                        this.log.trace(function () { return "Save entity \"" + _this.getEntityName() + "\""; });
                        return [2 /*return*/, this.connection
                                .getRepository(this.getEntityName())
                                .save(entity)];
                    case 2:
                        error_1 = _a.sent();
                        this.log.debug(function () { return "Could not save entity " + _this.getEntityName() + ": error=" + JSON.stringify(error_1); });
                        throw new RepositoryError(Logging.getMessage(error_1, "Could not save entity \"" + this.getEntityName() + "\""));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Searches an entity matching the given {@code primaryKey}.
     *
     * The entity will be found by TypeORM.
     *
     * @param {K} primaryKey - primary key to search
     *
     * @returns {Promise<Optional<T>>} - an Optional of the resulting entity
     * @throws {RepositoryError} if an error occurs during this operation
     */
    AbstractCRUDRepository.prototype.find = function (primaryKey) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.database.ready(this.connectionName)];
                    case 1:
                        _a.sent();
                        this.log.trace(function () { return "Find entity \"" + _this.getEntityName() + "\" by id \"" + primaryKey + "\""; });
                        return [4 /*yield*/, this.connection
                                .getRepository(this.getEntityName())
                                .findOneById(primaryKey)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, Optional.ofNullable(result)];
                    case 3:
                        error_2 = _a.sent();
                        this.log.debug(function () { return "Could not find entity \"" + _this.getEntityName() + "\" by id " + primaryKey + ": error=" + JSON.stringify(error_2); });
                        throw new RepositoryError(Logging.getMessage(error_2, "Could not find entity \"" + this.getEntityName() + "\" by id \"" + primaryKey + "\""));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes the given {@code entity} by searching for the database entry with the same id.
     *
     * The entity will be deleted by TypeORM.
     *
     * @param {T} entity - the entity to delete
     *
     * @throws {RepositoryError} if an error occurs during this operation
     */
    AbstractCRUDRepository.prototype.delete = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.database.ready(this.connectionName)];
                    case 1:
                        _a.sent();
                        this.log.trace(function () { return "Delete entity \"" + _this.getEntityName() + "\""; });
                        return [4 /*yield*/, this.connection
                                .getRepository(this.getEntityName())
                                .deleteById(entity[this.getIdName()])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        this.log.debug(function () { return "Could not delete entity \"" + _this.getEntityName() + "\": error=" + JSON.stringify(error_3); });
                        throw new RepositoryError(Logging.getMessage(error_3, "Could not delete entity \"" + this.getEntityName() + "\""));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns true if an entity matching the given {@code primaryKey} exists,
     * otherwise false.
     *
     * Uses the {@link AbstractCRUDRepository#find} method to check the existence of the entity.
     *
     * @param {K} primaryKey - primary key to check
     *
     * @returns {Promise<boolean>} true if it exists, otherwise false
     */
    AbstractCRUDRepository.prototype.exists = function (primaryKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find(primaryKey)];
                    case 1: return [2 /*return*/, (_a.sent()).isPresent()];
                }
            });
        });
    };
    return AbstractCRUDRepository;
}());
export { AbstractCRUDRepository };
/**
 * Indicates an error during a repository operation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var RepositoryError = /** @class */ (function (_super) {
    __extends(RepositoryError, _super);
    function RepositoryError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, RepositoryError.prototype);
        return _this;
    }
    return RepositoryError;
}(Error));
export { RepositoryError };
//# sourceMappingURL=repository.api.js.map