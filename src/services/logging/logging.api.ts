/**
 * Describes a logger that can log different levels.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface Logger {

  trace(msg: () => string): void
  debug(msg: () => string): void
  info(msg: () => string): void
  warn(msg: () => string): void
  error(msg: () => string): void
  fatal(msg: () => string): void
}

/**
 * Factory class to get loggers.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class LoggingFactory {

  getLogger(location: object | string): Logger {
    throw new Error("This method is not implemented yet");
  }
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
    throw new Error("This method is not implemented yet");
  }

  debug(msg: () => string): void {
    throw new Error("This method is not implemented yet");
  }

  info(msg: () => string): void {
    throw new Error("This method is not implemented yet");
  }

  warn(msg: () => string): void {
    throw new Error("This method is not implemented yet");
  }

  error(msg: () => string): void {
    throw new Error("This method is not implemented yet");
  }

  fatal(msg: () => string): void {
    throw new Error("This method is not implemented yet");
  }
}

/**
 * Describes a appender for a logger.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export interface LogAppender {

  /**
   * Logs the given {@code logEntry}.
   *
   * @param {LogEntry} logEntry - the entry to log
   */
  log(logEntry: LogEntry): void

  /**
   * Shuts down this appender.
   */
  shutdown(): void
}

/**
 * A log buffer does not log any message before the buffer size is reached.
 * If the buffer size is reached all log messages are logged.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export abstract class LogBuffer implements LogAppender {

  private readonly messages: Array<() => void> = [];

  constructor(
    private readonly buffer: number
  ) {}

  log(logEntry: LogEntry): void {
    throw new Error("This method is not implemented yet");
  }

  shutdown(): void {
    throw new Error("This method is not implemented yet");
  }

  protected abstract writeToBuffer(logEntry: LogEntry): void

  private logAll(): void {
    throw new Error("This method is not implemented yet");
  }
}

/**
 * A log level appender does only log the specific log levels or lower.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export abstract class LogLevelAppender extends LogBuffer {

  constructor(
    private readonly level: LogLevel,
    buffer: number = 10
  ) {
    super(buffer);
  }

  protected writeToBuffer(logEntry: LogEntry): void {
    throw new Error("This method is not implemented yet");
  }

  protected abstract write(logEntry: LogEntry): void
}

/**
 * Data object for log information.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export interface LogEntry {
 readonly level: LogLevel;
 readonly location: string;
 readonly time: number;
 message(): string;
}

/**
 * Defines possible log levels.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL
}
