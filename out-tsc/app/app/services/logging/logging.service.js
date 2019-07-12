import { isDevMode } from "../../devmode";
import { ConsoleLogAppender } from "./logging.appenders";
import { LogLevel } from "./logging.api";
import { hasOwnProperty } from 'tslint/lib/utils';
export var Logging;
(function (Logging) {
    var appenders = [
        new ConsoleLogAppender(isDevMode() ? LogLevel.TRACE : LogLevel.INFO)
    ];
    /**
     * Creates a {@link DefaultLogger} with the given location.
     *
     * @param {string} location - which is logging the message, when used inside a class, provide MyClass.name
     *
     * @returns {Logger} the resulting logger
     */
    function getLogger(location) {
        return new DefaultLogger(location, appenders);
    }
    Logging.getLogger = getLogger;
    /**
     * Shuts down all appenders used.
     */
    function shutdown() { appenders.forEach(function (it) { return it.shutdown(); }); }
    Logging.shutdown = shutdown;
    /**
     * Utility function to get a message from an error.
     * Useful for error logging, since javascript can throw any type.
     *
     * This method returns the errors message property if it exists, otherwise
     * it returns the given {@code fallback}.
     *
     * @param error - the object to check for the message property
     * @param {string} fallback - message to use as
     * @returns {string}
     */
    function getMessage(error, fallback) {
        if (hasOwnProperty(error, "message")) {
            return error.message;
        }
        return fallback;
    }
    Logging.getMessage = getMessage;
})(Logging || (Logging = {}));
/**
 * Default logger implementation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var DefaultLogger = /** @class */ (function () {
    function DefaultLogger(location, appenders) {
        this.location = location;
        this.appenders = appenders;
    }
    DefaultLogger.prototype.trace = function (msg) {
        var _this = this;
        this.appenders.forEach(function (it) { return it.log(_this.createEntry(LogLevel.TRACE, msg)); });
    };
    DefaultLogger.prototype.debug = function (msg) {
        var _this = this;
        this.appenders.forEach(function (it) { return it.log(_this.createEntry(LogLevel.DEBUG, msg)); });
    };
    DefaultLogger.prototype.info = function (msg) {
        var _this = this;
        this.appenders.forEach(function (it) { return it.log(_this.createEntry(LogLevel.INFO, msg)); });
    };
    DefaultLogger.prototype.warn = function (msg) {
        var _this = this;
        this.appenders.forEach(function (it) { return it.log(_this.createEntry(LogLevel.WARN, msg)); });
    };
    DefaultLogger.prototype.error = function (msg) {
        var _this = this;
        this.appenders.forEach(function (it) { return it.log(_this.createEntry(LogLevel.ERROR, msg)); });
    };
    DefaultLogger.prototype.fatal = function (msg) {
        var _this = this;
        this.appenders.forEach(function (it) { return it.log(_this.createEntry(LogLevel.FATAL, msg)); });
    };
    /**
     * Creates a {@link LogEntry} by the given arguments.
     *
     * @param {LogLevel} level - the log level
     * @param {() => string} msg - the message to log
     *
     * @returns {LogEntry} the resulting entry
     */
    DefaultLogger.prototype.createEntry = function (level, msg) {
        return {
            level: level,
            location: this.location,
            time: Date.now(),
            message: msg
        };
    };
    return DefaultLogger;
}());
export { DefaultLogger };
//# sourceMappingURL=logging.service.js.map