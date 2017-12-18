import {ConsoleLogAppender} from "./logging.appenders";
import {LogAppender, LogEntry, Logger, LogLevel} from "./logging.api";
import {isString} from "ionic-angular/es2015/util/util";

namespace Logging {

  const appenders: Array<LogAppender> = [
    new ConsoleLogAppender(LogLevel.WARN)
  ];

  /**
   * Creates a {@link DefaultLogger} with the given location.
   *
   * @param {{constructor: string} | string} location - which is logging the message, can be a class or any name
   * @returns {Logger}
   */
  export function getLogger(location: {constructor: string} | string): Logger {

    if (isString(location)) {
      return new DefaultLogger(location, appenders);
    }

    return new DefaultLogger(location.constructor, appenders);
  }

  /**
   * Shuts down all appenders used.
   */
  export function shutdown(): void { appenders.forEach(it => it.shutdown()) }
}

/**
 * Default logger implementation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class DefaultLogger implements Logger {

  constructor(
    private readonly location: string,
    private readonly appenders: Array<LogAppender>
  ) {}

  trace(msg: () => string): void {
    this.appenders.forEach(it => it.log(this.createEntry(LogLevel.TRACE, msg)))
  }

  debug(msg: () => string): void {
    this.appenders.forEach(it => it.log(this.createEntry(LogLevel.DEBUG, msg)))
  }

  info(msg: () => string): void {
    this.appenders.forEach(it => it.log(this.createEntry(LogLevel.INFO, msg)))
  }

  warn(msg: () => string): void {
    this.appenders.forEach(it => it.log(this.createEntry(LogLevel.WARN, msg)))
  }

  error(msg: () => string): void {
    this.appenders.forEach(it => it.log(this.createEntry(LogLevel.ERROR, msg)))
  }

  /**
   * Logs the given {@code msg} as log level {@link LogLevel#FATAL}.
   *
   * @param {() => string} msg - lambda that returns the message to log
   */
  fatal(msg: () => string): void {
    this.appenders.forEach(it => it.log(this.createEntry(LogLevel.FATAL, msg)))
  }

  /**
   * Creates a {@link LogEntry} by the given arguments.
   *
   * @param {LogLevel} level - the log level
   * @param {() => string} msg - the message to log
   *
   * @returns {LogEntry} the resulting entry
   */
  private createEntry(level: LogLevel, msg: () => string): LogEntry {
    return <LogEntry>{
      level: level,
      location: this.location,
      time: Date.now(),
      message: msg
    };
  }
}
