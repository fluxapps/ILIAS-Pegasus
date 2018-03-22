import {HardwareFeature, HardwareRequirement} from "./hardware-feature.service";
import {Modal, ModalController} from "ionic-angular";
import {DiagnosticUtil} from "./diagnostics.util";
import {LocationFallbackScreen} from "../../../app/fallback/location/location-fallback.component";
import {LocationAccessError, RoamingAccessError, WifiAccessError} from "./hardware-access.errors";
import {WifiFallbackScreen} from "../../../app/fallback/wifi/wifi-fallback.component";
import {RoamingFallbackScreen} from "../../../app/fallback/roaming/roaming-fallback.component";
import {Optional} from "../../../util/util.optional";

/**
 * Implements parts of a {@link HardwareRequirement} that are exactly the same across all specific requirements.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export abstract class AbstractRequirement implements HardwareRequirement {

  private onFailureAction: Optional<Function> = Optional.empty();

  constructor(
    private readonly modalCtrl: ModalController
  ) {}

  /**
   * Sets the given {@code action} as an on failure callback to this requirement.
   *
   * @param {Function} action - the action to set
   *
   * @returns {HardwareRequirement} this instance
   */
  onFailure(action: Function): HardwareRequirement {
    this.onFailureAction = Optional.of(action);
    return this;
  }

  abstract check(): Promise<void>

  /**
   * Creates a modal with the given {@code page}.
   * If this instance contains an on failure action, it will be set
   * as a callback on the modal dismiss action.
   * @see ModalController#onDidDismiss
   *
   * @param {Function} page - the angular component to open
   */
  protected async createFallbackScreen(page: Function): Promise<void> {
    const modal: Modal = this.modalCtrl.create(page, undefined,
      { cssClass: "modal-fullscreen" }
    );
    await this.onFailureAction.ifPresent(it => modal.onDidDismiss((..._) => it()));
    await modal.present();
  }
}

/**
 * Hardware requirement for the location.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class LocationRequirement extends AbstractRequirement {

  constructor(
    modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil
  ) {super(modalCtl)}

  async check(): Promise<void> {

    if(!(await this.diagnosticUtil.isLocationEnabled())) {

      await this.createFallbackScreen(LocationFallbackScreen);

      throw new LocationAccessError("Can not use location: Permission Denied");
    }
  }
}

/**
 * Hardware requirement for wifi.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class WifiRequirement extends AbstractRequirement {

  constructor(
    modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil
  ) {super(modalCtl)}

  async check(): Promise<void> {

    if(!(await this.diagnosticUtil.isWifiEnabled())) {

      await this.createFallbackScreen(WifiFallbackScreen);

      throw new WifiAccessError("Can not use wifi: Disabled");
    }
  }
}

/**
 * ANDROID ONLY!!!
 *
 * Hardware requirement for roaming service.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class RoamingRequirement extends AbstractRequirement {

  constructor(
    modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil
  ) {super(modalCtl)}

  async check(): Promise<void> {

    if(!(await this.diagnosticUtil.isRoamingEnabled())) {

      await this.createFallbackScreen(RoamingFallbackScreen);

      throw new RoamingAccessError("Can not use roaming service: Disabled");
    }
  }
}

/**
 * Collection of hardware requirements where at least one of the requirements must be fulfilled.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class AnyRequirement extends AbstractRequirement {

  constructor(
    modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil,
    private readonly features: Array<HardwareFeature>
  ) {super(modalCtl)}

  async check(): Promise<void> {
    throw new Error("This method is not implemented yet");
  }
}

/**
 * Collection of hardware requirements where all requirements must be fulfilled.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class AllRequirement extends AbstractRequirement {

  constructor(
    modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil,
    private readonly features: Array<HardwareFeature>
  ) {super(modalCtl)}

  async check(): Promise<void> {
    throw new Error("This method is not implemented yet");
  }
}
