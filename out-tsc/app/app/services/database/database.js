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
import { Logging } from "../logging/logging.service";
/** misc */
import { createConnection } from "typeorm";
import { DATABASE_CONFIGURATION_ADAPTER, DatabaseConnectionRegistry, DEFAULT_CONNECTION_NAME } from "./database.api";
/**
 * The Database can be used to get information about a certain connection.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.1
 */
var Database = /** @class */ (function () {
    function Database(configurationAdapter, registry) {
        this.configurationAdapter = configurationAdapter;
        this.registry = registry;
        this.readyConnections = [];
        this.log = Logging.getLogger(Database_1.name);
        this.configurationAdapter.addConnections(this.registry);
    }
    Database_1 = Database;
    /**
     * Resolves a promise, when the connection matching the given {@code connectionName}
     * is created and therefore ready to use.
     *
     * A connection can be get with the typeORM function getConnection.
     * For additional usage when a connection is up see http://typeorm.io/#/working-with-entity-manager
     *
     * If no connection name is given, the default connection name is used.
     * @see DEFAULT_CONNECTION_NAME
     *
     * If the given {@code connectionName} is not created yet, it will be created first before
     * resolving a promise.
     *
     * @param {string} connectionName - the connection name to use
     */
    Database.prototype.ready = function (connectionName) {
        if (connectionName === void 0) { connectionName = DEFAULT_CONNECTION_NAME; }
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.readyConnections.indexOf(connectionName) > -1) {
                            return [2 /*return*/, Promise.resolve()];
                        }
                        connection = this.registry.getConnection(connectionName);
                        this.log.trace(function () { return "Create database connection: name=" + connectionName; });
                        return [4 /*yield*/, createConnection(connection.getOptions())];
                    case 1:
                        _a.sent();
                        this.log.info(function () { return "Connection " + connectionName + " is ready"; });
                        if (!connection.hasOwnProperty("init")) return [3 /*break*/, 3];
                        return [4 /*yield*/, (connection["init"]())];
                    case 2:
                        _a.sent();
                        this.log.info(function () { return "Connection " + connectionName + " bootstrapped"; });
                        _a.label = 3;
                    case 3:
                        this.readyConnections.push(connectionName);
                        return [2 /*return*/];
                }
            });
        });
    };
    var Database_1;
    Database = Database_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(DATABASE_CONFIGURATION_ADAPTER)),
        __metadata("design:paramtypes", [Object, DatabaseConnectionRegistry])
    ], Database);
    return Database;
}());
export { Database };
//# sourceMappingURL=database.js.map