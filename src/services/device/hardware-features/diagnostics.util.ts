/** angular */
import {Platform} from "ionic-angular";
import {Injectable} from "@angular/core";
/** ionic-native */
import {Diagnostic} from "@ionic-native/diagnostic/ngx";
/** logging */
import {Logger} from "../../logging/logging.api";
import {Logging} from "../../logging/logging.service";

/**
 * Utils class to check hardware features with {@link Diagnostic}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable({
    providedIn: "root"
})
export class DiagnosticUtil {

  private readonly log: Logger = Logging.getLogger(DiagnosticUtil.name);

  constructor(
    private readonly platform: Platform,
    private readonly diagnostic: Diagnostic
  ) {}

  /**
   * @returns {Promise<boolean>} false if the location authorization status is denied, otherwise false
   */
  async isLocationEnabled(): Promise<boolean> {

    try {

      this.log.info(() => "Evaluate location authorization status");

      const status: string = await this.diagnostic.getLocationAuthorizationStatus();

      this.log.info(() => `Location authorization status: ${status}`);

      return status !== this.diagnostic.permissionStatus.DENIED;
    } catch(error) {

      this.log.warn(() => `Could not evaluate Location Authorization Status: ${error}`);
      return true;
    }
  }

  /**
   * @returns {Promise<boolean>} true if wifi is enabled, otherwise false
   */
  async isWifiEnabled(): Promise<boolean> {

    try {

      this.log.info(() => "Evaluate wifi status");

      const enabled: boolean = await this.diagnostic.isWifiAvailable();

      this.log.info(() => (enabled)? "Wifi is enabled" : "Wifi is disabled");

      return enabled;

    } catch(error) {

      this.log.warn(() => `Could not evaluate wifi Status: ${error}`);
      return true;
    }
  }

  /**
   * ANDROID ONLY!!! If used on any non Android device, always true will be returned.
   *
   * @returns {Promise<boolean>} true if roaming service is enabled, otherwise false
   */
  async isRoamingEnabled(): Promise<boolean> {

    try {

      if(this.platform.is("android")) {

        this.log.info(() => "Evaluate roaming service status");

        const enabled: boolean = await this.diagnostic.isDataRoamingEnabled();

        this.log.info(() => (enabled)? "Roaming Service is enabled" : "Roaming service is disabled");

        return enabled;
      }

      this.log.info(() => "Can not evaluate roaming service on a non Android device");
      return true;

    } catch(error) {

      this.log.warn(() => `Could not evaluate roaming service status: ${error}`);
      return true;
    }
  }
}
