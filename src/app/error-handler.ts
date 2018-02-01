import {ErrorHandler, Injectable} from "@angular/core";
import {IonicErrorHandler} from "ionic-angular";
import {HardwareAccessError} from "../services/device/hardware-features/hardware-access.errors";
import {isDefined, isFunction} from "ionic-angular/es2015/util/util";
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
import {isNullOrUndefined} from "util";

/**
 * Error handler of ILIAS Pegasus
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
@Injectable()
export class PegasusErrorHandler implements ErrorHandler {

  private readonly log: Logger = Logging.getLogger(PegasusErrorHandler.name);

  constructor(
    private readonly ionicErrorHandler: IonicErrorHandler
  ) {}

  /**
   * Handles the given {@code error}.
   *
   * If the error is an instance of {@link HardwareAccessError}, it will be ignored.
   * Such an error is already handled and part of the fallback screen functionality.
   *
   * If the app runs in the ionic dev server, the error will be delegated to the
   * {@link IonicErrorHandler} in order to display a stacktrace.
   *
   * @param error - the thrown error
   */
  handleError(error: any): void {

    try {

      const errorInstance: Error = this.getErrorInstance(error);

      // Ignore HardwareAccessError
      if (errorInstance instanceof HardwareAccessError) {
        return;
      }

      const monitor: any = window["IonicDevServer"];

      if (isDefined(monitor) && monitor.hasOwnProperty("handleError") && isFunction(monitor.handleError)) {
        this.ionicErrorHandler.handleError(error);
      } else {
        // TODO: Add alerts
      }

    } catch (err) {
      this.log.warn(() => `Error occurred during error handling: ${JSON.stringify(err)}`);
    }
  }

  getErrorInstance(error: any): Error {
    if(!isNullOrUndefined(error)
      && error.hasOwnProperty("rejection")
      && error.rejection.hasOwnProperty("constructor")
      && isFunction(error.rejection.constructor)
    ) {
      return new error.rejection.constructor("");
    }

    return error;
  }
}
