import {LogEntry, LogLevel, LogLevelAppender} from "./logging.api";

/**
 * An appender that logs to the console.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class ConsoleLogAppender extends LogLevelAppender {

  protected write(logEntry: LogEntry): void {
    const time: Date = new Date(logEntry.time);
    console.log(`[${time.toLocaleString()}] [${LogLevel[logEntry.level]}] ${logEntry.location} - ${logEntry.message()}`);
  }
}
