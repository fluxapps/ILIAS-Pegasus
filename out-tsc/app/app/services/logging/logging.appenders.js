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
import { LogLevel, LogLevelAppender } from "./logging.api";
/**
 * An appender that logs to the console.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var ConsoleLogAppender = /** @class */ (function (_super) {
    __extends(ConsoleLogAppender, _super);
    function ConsoleLogAppender() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConsoleLogAppender.prototype.write = function (logEntry) {
        var time = new Date(logEntry.time);
        var message = "[" + time.toLocaleString() + "] [" + LogLevel[logEntry.level] + "] " + logEntry.location + " - " + logEntry.message();
        switch (logEntry.level) {
            case LogLevel.TRACE:
            case LogLevel.DEBUG:
                //console.trace will show stacktrace which is to verbose
                //console.debug will not show up in the ionic remote logs
                console.log(message);
                return;
            case LogLevel.INFO:
                console.info(message);
                return;
            case LogLevel.WARN:
                console.warn(message);
                return;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(message);
                return;
        }
    };
    return ConsoleLogAppender;
}(LogLevelAppender));
export { ConsoleLogAppender };
//# sourceMappingURL=logging.appenders.js.map