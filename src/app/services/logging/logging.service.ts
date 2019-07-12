import {isDevMode} from "../../devmode";
import {ConsoleLogAppender} from "./logging.appenders";
import {LogAppender, LogEntry, Logger, LogLevel} from "./logging.api";
import {hasOwnProperty} from 'tslint/lib/utils';

export namespace Logging {

  const appenders: Array<LogAppender> = [
    new ConsoleLogAppender(isDevMode() ? LogLevel.TRACE : LogLevel.INFO)
  ];

  /**
   * Creates a {@link DefaultLogger} with the given location.
   *
   * @param {string} location - which is logging the message, when used inside a class, provide MyClass.name
   *
   * @returns {Logger} the resulting logger
   */
  export function getLogger(location: string): Logger {
    return new DefaultLogger(location, appenders);
  }

  /**
   * Shuts down all appenders used.
   */
  export function shutdown(): void { appenders.forEach(it => it.shutdown()) }

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
  export function getMessage(error: any, fallback: string): string {

    if (hasOwnProperty(error, "message")) {
      return error.message;
    }
    return fallback;
  }
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
