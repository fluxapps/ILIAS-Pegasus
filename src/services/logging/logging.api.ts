/**
 * Describes a logger that can log different levels.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface Logger {

  /**
   * Logs the given {@code msg} as log level {@link LogLevel#TRACE}.
   *
   * @param {() => string} msg - lambda that returns the message to log
   */
  trace(msg: () => string): void

  /**
   * Logs the given {@code msg} as log level {@link LogLevel#DEBUG}.
   *
   * @param {() => string} msg - lambda that returns the message to log
   */
  debug(msg: () => string): void

  /**
   * Logs the given {@code msg} as log level {@link LogLevel#INFO}.
   *
   * @param {() => string} msg - lambda that returns the message to log
   */
  info(msg: () => string): void

  /**
   * Logs the given {@code msg} as log level {@link LogLevel#WARN}.
   *
   * @param {() => string} msg - lambda that returns the message to log
   */
  warn(msg: () => string): void

  /**
   * Logs the given {@code msg} as log level {@link LogLevel#ERROR}.
   *
   * @param {() => string} msg - lambda that returns the message to log
   */
  error(msg: () => string): void

  /**
   * Logs the given {@code msg} as log level {@link LogLevel#FATAL}.
   *
   * @param {() => string} msg - lambda that returns the message to log
   */
  fatal(msg: () => string): void
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

  private messages: Array<() => void> = [];

  constructor(
    private readonly buffer: number
  ) {}

  /**
   * Pushes the log entry to the buffer.
   * If the buffer size is reached all logs will be logged.
   *
   * @param {LogEntry} logEntry - the entry to log
   */
  log(logEntry: LogEntry): void {

    this.messages.push(() => this.writeToBuffer(logEntry));

    if (this.messages.length === this.buffer) {
      this.logAll();
    }
  }

  /**
   * Logs all remaining logs.
   */
  shutdown(): void {
    this.logAll();
  }

  /**
   * Is called from this appender, if the buffer size is reached.
   *
   * @param {LogEntry} logEntry - the entry to log
   */
  protected abstract writeToBuffer(logEntry: LogEntry): void

  /**
   * Logs all messages and clears them afterwards.
   */
  private logAll(): void {
    this.messages.forEach(it => it());
    this.messages = [];
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

  /**
   * Writes the given {@code logEntry} to the {@link LogBuffer}
   * if its match the log level of this appender.
   *
   * @param {LogEntry} logEntry
   */
  protected writeToBuffer(logEntry: LogEntry): void {
    if (this.include(logEntry)) {
      this.write(logEntry);
    }
  }

  /**
   * Will be called from this appender, if the log entry does match
   * this appenders log level.
   *
   * @param {LogEntry} logEntry - the entry to write
   */
  protected abstract write(logEntry: LogEntry): void

  /**
   * Returns true, if the given {@code logEntry} is included in this appenders log level.
   *
   * @param {LogEntry} logEntry - the entry to test
   *
   * @returns {boolean} true, if the entry should be logged, otherwise false
   */
  private include(logEntry: LogEntry): boolean {

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
  }

  private isDebug(level: LogLevel): boolean {
    switch (level) {
      case LogLevel.TRACE:
        return false;
      default:
        return true;
    }
  }

  private isInfo(level: LogLevel): boolean {
    switch (level) {
      case LogLevel.TRACE:
        return false;
      case LogLevel.DEBUG:
        return false;
      default:
        return true;
    }
  }

  private isWarn(level: LogLevel): boolean {
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
  }

  private isError(level: LogLevel): boolean {
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
  }
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
