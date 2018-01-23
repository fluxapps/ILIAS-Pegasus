import {
  HardwareAccessError, LocationAccessError, RoamingAccessError,
  WifiAccessError
} from "../../services/device/hardware-features/hardware-access.errors";
import {ModalController} from "ionic-angular";
import {WifiFallbackScreen} from "./wifi/wifi-fallback.component";
import {LocationFallbackScreen} from "./location/location-fallback.component";
import {RoamingFallbackScreen} from "./roaming/roaming-fallback.component";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {Injectable} from "@angular/core";

/**
 * Error handler for the fallback screen.
 * This handler displays an appropriate error page and only handles a {@link HardwareAccessError}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class FallbackscreenErrorHandler {

  private readonly log: Logger = Logging.getLogger(FallbackscreenErrorHandler.name);

  constructor(
    private readonly ctl: ModalController
  ) {}

  /**
   * Handles the given {@code error} by pushing the appropriate
   * fallback screen to the {@link Nav}.
   *
   * @param {HardwareAccessError} error - a hardware access error to handle
   */
  handle(error: HardwareAccessError): void {

    this.log.info(() => `Handle fallback error: ${error.name}`);

    if (error instanceof WifiAccessError) {
      // this.nav.push(WifiFallbackScreen);
      this.ctl.create(WifiFallbackScreen).present();
    }

    if (error instanceof LocationAccessError) {
      // this.nav.push(LocationFallbackScreen);
      console.log("show location error page");
      this.ctl.create(LocationFallbackScreen).present();
    }

    if (error instanceof RoamingAccessError) {
      // this.nav.push(RoamingFallbackScreen);
      this.ctl.create(RoamingFallbackScreen).present();
    }
  }
}
