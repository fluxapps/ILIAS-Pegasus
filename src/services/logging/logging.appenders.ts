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
      const message: string = `[${time.toLocaleString()}] [${LogLevel[logEntry.level]}] ${logEntry.location} - ${logEntry.message()}`;
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
  }
}
