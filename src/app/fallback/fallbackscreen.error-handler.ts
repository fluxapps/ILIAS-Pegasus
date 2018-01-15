import {
  HardwareAccessError, LocationAccessError, RoamingAccessError,
  WifiAccessError
} from "../../services/device/hardware-features/hardware-access.errors";
import {Nav} from "ionic-angular";
import {WifiFallbackScreen} from "./wifi/wifi-fallback.component";
import {LocationFallbackScreen} from "./location/location-fallback.component";
import {RoamingFallbackScreen} from "./roaming/roaming-fallback.component";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";

/**
 * Error handler for the fallback screen.
 * This handler displays an appropriate error page and only handles a {@link HardwareAccessError}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class FallbackscreenErrorHandler {

  private readonly log: Logger = Logging.getLogger(FallbackscreenErrorHandler.name);

  constructor(
    private readonly nav: Nav
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
      this.nav.push(WifiFallbackScreen);
    }

    if (error instanceof LocationAccessError) {
      this.nav.push(LocationFallbackScreen);
    }

    if (error instanceof RoamingAccessError) {
      this.nav.push(RoamingFallbackScreen);
    }
  }
}
