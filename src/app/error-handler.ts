import {ErrorHandler, Injectable} from "@angular/core";
import {IonicErrorHandler} from "ionic-angular";
import {FallbackscreenErrorHandler} from "./fallback/fallbackscreen.error-handler";
import {HardwareAccessError} from "../services/device/hardware-features/hardware-access.errors";
import {isDefined, isFunction} from "ionic-angular/es2015/util/util";
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";

/**
 * Error handler of ILIAS Pegasus
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class PegasusErrorHandler implements ErrorHandler {

  private readonly log: Logger = Logging.getLogger(PegasusErrorHandler.name);

  constructor(
    private readonly ionicErrorHandler: IonicErrorHandler,
    private readonly fallback: FallbackscreenErrorHandler
  ) {}


  /**
   * Handles the given {@code error}.
   *
   * If the error is an instance of {@link HardwareAccessError}, it will be delegated to
   * the {@link FallbackscreenErrorHandler}.
   *
   * If the app runs in the ionic dev server, the error will be delegated to the
   * {@link IonicErrorHandler} in order to display a stacktrace.
   *
   * @param error - the thrown error
   */
  handleError(error: any): void {

    try {
      console.log("Error handler");

      // console.log(error.rejection.constructor.prototype);
      // console.log(this.isHardwareAccessError(error));

      // console.log(this._findOriginalError(error));

      const originalError: Error = new error.rejection.constructor("");

      // console.log(originalError instanceOf HardwareAccessError);


      // if (error instanceof Error) {
      //   console.log("It is an error: " + error.name);
      //
      //
      //
      // } else {
      //   console.log("It is something else, properly any")
      // }

      if (originalError instanceof HardwareAccessError) {
        this.fallback.handle(originalError);
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

  _findOriginalError(error: Error): any {
    let e = this.getOriginalError(error);
    while (e && this.getOriginalError(e)) {
      e = this.getOriginalError(e);
    }

    return e;
  }

  getOriginalError(error: Error): Error {
    return (error as any)["ngOriginalError"];
  }
}
