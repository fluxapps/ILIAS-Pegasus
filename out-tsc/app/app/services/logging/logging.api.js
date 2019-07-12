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
/**
 * Describes a logger that can log different levels.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
import { isDevMode } from "../../devmode";
/**
 * A log buffer does not log any message before the buffer size is reached.
 * If the buffer size is reached all log messages are logged.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var LogBuffer = /** @class */ (function () {
    function LogBuffer(buffer) {
        this.buffer = buffer;
        this.messages = [];
    }
    /**
     * Pushes the log entry to the buffer.
     * If the buffer size is reached all logs will be logged.
     *
     * @param {LogEntry} logEntry - the entry to log
     */
    LogBuffer.prototype.log = function (logEntry) {
        var _this = this;
        this.messages.push(function () { return _this.writeToBuffer(logEntry); });
        if (this.messages.length === this.buffer) {
            this.logAll();
        }
    };
    /**
     * Logs all remaining logs.
     */
    LogBuffer.prototype.shutdown = function () {
        this.logAll();
    };
    /**
     * Logs all messages and clears them afterwards.
     */
    LogBuffer.prototype.logAll = function () {
        this.messages.forEach(function (it) { return it(); });
        this.messages = [];
    };
    return LogBuffer;
}());
export { LogBuffer };
/**
 * A log level appender does only log the specific log levels or lower.
 * The buffer of this appender will always be 1, if the app runs is dev server.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var LogLevelAppender = /** @class */ (function (_super) {
    __extends(LogLevelAppender, _super);
    function LogLevelAppender(level, buffer) {
        if (buffer === void 0) { buffer = 10; }
        var _this = _super.call(this, isDevMode() ? 1 : buffer) || this;
        _this.level = level;
        return _this;
    }
    /**
     * Writes the given {@code logEntry} to the {@link LogBuffer}
     * if its match the log level of this appender.
     *
     * @param {LogEntry} logEntry
     */
    LogLevelAppender.prototype.writeToBuffer = function (logEntry) {
        if (this.include(logEntry)) {
            this.write(logEntry);
        }
    };
    /**
     * Returns true, if the given {@code logEntry} is included in this appenders log level.
     *
     * @param {LogEntry} logEntry - the entry to test
     *
     * @returns {boolean} true, if the entry should be logged, otherwise false
     */
    LogLevelAppender.prototype.include = function (logEntry) {
        switch (this.level) {
            case LogLevel.TRACE:
                return true;
            case LogLevel.DEBUG:
                return this.isDebug(logEntry.level);
            case LogLevel.INFO:
                return this.isInfo(logEntry.level);
            case LogLevel.WARN:
                return this.isWarn(logEntry.level);
            case LogLevel.ERROR:
                return this.isError(logEntry.level);
            default:
                return false;
        }
    };
    LogLevelAppender.prototype.isDebug = function (level) {
        switch (level) {
            case LogLevel.TRACE:
                return false;
            default:
                return true;
        }
    };
    LogLevelAppender.prototype.isInfo = function (level) {
        switch (level) {
            case LogLevel.TRACE:
                return false;
            case LogLevel.DEBUG:
                return false;
            default:
                return true;
        }
    };
    LogLevelAppender.prototype.isWarn = function (level) {
        switch (level) {
            case LogLevel.TRACE:
                return false;
            case LogLevel.DEBUG:
                return false;
            case LogLevel.INFO:
                return false;
            default:
                return true;
        }
    };
    LogLevelAppender.prototype.isError = function (level) {
        switch (level) {
            case LogLevel.TRACE:
                return false;
            case LogLevel.DEBUG:
                return false;
            case LogLevel.INFO:
                return false;
            case LogLevel.WARN:
                return false;
            default:
                return true;
        }
    };
    return LogLevelAppender;
}(LogBuffer));
export { LogLevelAppender };
/**
 * Defines possible log levels.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
})(LogLevel || (LogLevel = {}));
//# sourceMappingURL=logging.api.js.map