import {ConsoleLogAppender} from "./logging.appenders";
import {LogAppender, LogEntry, Logger, LogLevel} from "./logging.api";
import {isString} from "ionic-angular/es2015/util/util";

namespace Logging {

  const appenders: Array<LogAppender> = [
    new ConsoleLogAppender(LogLevel.WARN)
  ];

  export function getLogger(location: {constructor: string} | string): Logger {

    if (isString(location)) {
      return new DefaultLoger(location, appenders);
    }

    return new DefaultLoger(location.constructor, appenders);
  }

  export function shutdown(): void { appenders.forEach(it => it.shutdown()) }
}

/**
 * Default logger implementation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class DefaultLoger implements Logger {

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

  private createEntry(level: LogLevel, msg: () => string): LogEntry {
    return <LogEntry>{
      level: level,
      location: this.location,
      time: Date.now(),
      message: msg
    };
  }
}
