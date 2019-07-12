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
/** migration */
import { MIGRATION_SUPPLIER, MigrationError, MigrationVersion } from "./migration.api";
import { InitDatabase } from "../../migrations/V__1-init-database";
import { AddObjectAttributes } from "../../migrations/V__2-add-object-attributes";
import { CreateLearnplace } from "../../migrations/V__3-create-learnplace-shema";
import { CreateNews } from "../../migrations/V__4-create-news-shema";
import { UpdateUserSettingsSyncSchema } from "../../migrations/V__5-update-user-settings-sync-schema";
import { MigrateOfflineAndFavorites } from "../../migrations/V__6-migrate-offline-and-favorites";
import { Logging } from "../logging/logging.service";
/** misc */
import { getConnection } from "typeorm";
import { PEGASUS_CONNECTION_NAME } from "../../config/typeORM-config";
/**
 * DB Migration with TypeORM.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
var TypeOrmDbMigration = /** @class */ (function () {
    function TypeOrmDbMigration(migrationSupplier) {
        this.migrationSupplier = migrationSupplier;
        this.log = Logging.getLogger(TypeOrmDbMigration_1.name);
    }
    TypeOrmDbMigration_1 = TypeOrmDbMigration;
    /**
     * Migrates the database with all migrations found by the {@link MigrationSupplier}.
     *
     * @throws {MigrationError} if the migration fails
     */
    TypeOrmDbMigration.prototype.migrate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, queryRunner, migrationTable, migrations, _loop_1, this_1, _i, migrations_1, it, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        connection = getConnection(PEGASUS_CONNECTION_NAME);
                        queryRunner = connection.createQueryRunner();
                        migrationTable = new CreateMigrationTable();
                        return [4 /*yield*/, migrationTable.up(queryRunner)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.migrationSupplier.get()];
                    case 2:
                        migrations = _a.sent();
                        migrations.sort(function (first, second) { return first.version.getVersion() - second.version.getVersion(); });
                        _loop_1 = function (it) {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, queryRunner.query("SELECT * FROM migrations WHERE id = ?", [it.version.getVersion()])];
                                    case 1:
                                        result = _a.sent();
                                        this_1.log.debug(function () { return "Migrations Table result: " + JSON.stringify(result); });
                                        if (!(result.length < 1)) return [3 /*break*/, 4];
                                        this_1.log.info(function () { return "Run database migration: version=" + it.version.getVersion(); });
                                        return [4 /*yield*/, it.up(queryRunner)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, queryRunner.query("INSERT INTO migrations (id) VALUES (?)", [it.version.getVersion()])];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, migrations_1 = migrations;
                        _a.label = 3;
                    case 3:
                        if (!(_i < migrations_1.length)) return [3 /*break*/, 6];
                        it = migrations_1[_i];
                        return [5 /*yield**/, _loop_1(it)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        this.log.info(function () { return "Successfully migrate database"; });
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        this.log.debug(function () { return "Database Migration Error: " + JSON.stringify(error_1); });
                        throw new MigrationError("Could not finish database migration");
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reverts the last n steps with typeORM connection.
     *
     * @param {number} steps - step count to revert
     *
     * @throws {MigrationError} if a revert step fails
     */
    TypeOrmDbMigration.prototype.revert = function (steps) {
        return __awaiter(this, void 0, void 0, function () {
            var currentStep, connection, queryRunner, migrations, migration, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentStep = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        connection = getConnection(PEGASUS_CONNECTION_NAME);
                        queryRunner = connection.createQueryRunner();
                        return [4 /*yield*/, this.migrationSupplier.get()];
                    case 2:
                        migrations = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(currentStep < steps)) return [3 /*break*/, 7];
                        migration = migrations.pop();
                        return [4 /*yield*/, migration.down(queryRunner)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DELETE FROM migrations WHERE id = ?", [migration.version.getVersion()])];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        currentStep++;
                        return [3 /*break*/, 3];
                    case 7:
                        this.log.info(function () { return "Successfully revert " + steps + " database migrations"; });
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _a.sent();
                        throw new MigrationError("Could not revert step " + currentStep);
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    var TypeOrmDbMigration_1;
    TypeOrmDbMigration = TypeOrmDbMigration_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(MIGRATION_SUPPLIER)),
        __metadata("design:paramtypes", [Object])
    ], TypeOrmDbMigration);
    return TypeOrmDbMigration;
}());
export { TypeOrmDbMigration };
/**
 * A simple migration supplier, that supplies migrations,
 * that are created in this class.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var SimpleMigrationSupplier = /** @class */ (function () {
    function SimpleMigrationSupplier() {
    }
    /**
     * Returns all migration that are being executed by the {@link DBMigration}.
     *
     * @returns {Promise<Array<Migration>>} the migrations to run
     */
    SimpleMigrationSupplier.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [
                        new InitDatabase(),
                        new AddObjectAttributes(),
                        new CreateLearnplace(),
                        new CreateNews(),
                        new UpdateUserSettingsSyncSchema(),
                        new MigrateOfflineAndFavorites()
                    ]];
            });
        });
    };
    SimpleMigrationSupplier = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], SimpleMigrationSupplier);
    return SimpleMigrationSupplier;
}());
export { SimpleMigrationSupplier };
/**
 * Special migration, which setups the migration table,
 * to execute further migrations.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var CreateMigrationTable = /** @class */ (function () {
    function CreateMigrationTable() {
        this.version = new MigrationVersion("V__0");
    }
    /**
     * Creates the migration table, in which all migrations will be write in.
     *
     * @param {QueryRunner} queryRunner - to execute sql queries
     */
    CreateMigrationTable.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("CREATE TABLE IF NOT EXISTS migrations (id INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes the migration table.
     *
     * @param {QueryRunner} queryRunner - to execute sql queries
     */
    CreateMigrationTable.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("DELETE TABLE migrations")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return CreateMigrationTable;
}());
//# sourceMappingURL=migration.service.js.map