import {LogEntry, LogLevelAppender} from "./logging.api";

/**
 * An appender that logs to the console.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class ConsoleLogAppender extends LogLevelAppender {

  protected write(logEntry: LogEntry): void {
    throw new Error("This method is not implemented yet");
  }
}
