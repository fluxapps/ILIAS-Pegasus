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
import { InjectionToken } from "@angular/core";
var BASE_10 = 10;
var VERSION_NUMBER = 1;
export var DB_MIGRATION = new InjectionToken("db migration token");
export var MIGRATION_SUPPLIER = new InjectionToken("migration supplier token");
/**
 * Defines a migration version. This class ensures, that a version has a correct value.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var MigrationVersion = /** @class */ (function () {
    function MigrationVersion(version) {
        this.pattern = new RegExp("^V__(\\d{1,})$");
        if (this.pattern.test(version)) {
            var matches = this.pattern.exec(version);
            this.versionNumber = parseInt(matches[VERSION_NUMBER], BASE_10);
        }
        else {
            throw new MigrationVersionError("Invalid version number: " + version);
        }
    }
    MigrationVersion.prototype.getVersion = function () { return this.versionNumber; };
    return MigrationVersion;
}());
export { MigrationVersion };
/**
 * Indicates a failure during a database migration.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var MigrationError = /** @class */ (function (_super) {
    __extends(MigrationError, _super);
    function MigrationError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, MigrationError.prototype);
        return _this;
    }
    return MigrationError;
}(Error));
export { MigrationError };
/**
 * Indicates a invalid migration version number.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var MigrationVersionError = /** @class */ (function (_super) {
    __extends(MigrationVersionError, _super);
    function MigrationVersionError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, MigrationVersionError.prototype);
        return _this;
    }
    return MigrationVersionError;
}(MigrationError));
export { MigrationVersionError };
//# sourceMappingURL=migration.api.js.map