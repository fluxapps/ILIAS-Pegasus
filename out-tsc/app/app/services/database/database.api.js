var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, InjectionToken } from "@angular/core";
import { CordovaDatabaseConnectionImpl } from "./cordova.database";
import { NoSuchElementError } from "../../error/errors";
export var DEFAULT_CONNECTION_NAME = "default";
export var DATABASE_CONFIGURATION_ADAPTER = new InjectionToken("token for database configurer");
/**
 * Registry to add different types of database connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var DatabaseConnectionRegistry = /** @class */ (function () {
    function DatabaseConnectionRegistry() {
        this.connections = new Map();
    }
    DatabaseConnectionRegistry.prototype.addConnection = function (name, options) {
        if (name === void 0) { name = DEFAULT_CONNECTION_NAME; }
        var connection = new DatabaseConnection(name);
        this.connections.set(name, options(connection));
    };
    DatabaseConnectionRegistry.prototype.getConnection = function (name) {
        if (name === void 0) { name = DEFAULT_CONNECTION_NAME; }
        try {
            return this.connections.get(name);
        }
        catch (error) {
            throw new NoSuchElementError("Could not find a connection with name: " + name);
        }
    };
    DatabaseConnectionRegistry = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], DatabaseConnectionRegistry);
    return DatabaseConnectionRegistry;
}());
export { DatabaseConnectionRegistry };
/**
 * Provides specific database connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var DatabaseConnection = /** @class */ (function () {
    function DatabaseConnection(name) {
        this.name = name;
    }
    DatabaseConnection.prototype.cordova = function () {
        return new CordovaDatabaseConnectionImpl(this.name);
    };
    return DatabaseConnection;
}());
export { DatabaseConnection };
//# sourceMappingURL=database.api.js.map