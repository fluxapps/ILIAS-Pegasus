import {HardwareFeature, HardwareRequirement} from "./hardware-feature.service";
import {Modal, ModalController} from "ionic-angular";
import {DiagnosticUtil} from "./diagnostics.util";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {Consumer} from "../../../declarations";
import {LocationFallbackScreen} from "../../../app/fallback/location/location-fallback.component";
import {LocationAccessError} from "./hardware-access.errors";

/**
 * Implements parts of a {@link HardwareRequirement} that are exactly the same across all specific requirements.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export abstract class AbstractRequirement implements HardwareRequirement {

  private onFailureAction: Function | undefined = undefined;

  onFailure(action: Function): HardwareRequirement {
    this.onFailureAction = action;
    return this;
  }

  abstract check(): Promise<void>

  protected ifOnFailure(consumer: Consumer<Function>): void {
    if (!isUndefined(this.onFailureAction)) {
      consumer(this.onFailureAction);
    }
  }
}

/**
 * Hardware requirement for the location.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class LocationRequirement extends AbstractRequirement {

  constructor(
    private readonly modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil
  ) {super()}

  async check(): Promise<void> {

    if(!(await this.diagnosticUtil.isLocationEnabled())) {

      const modal: Modal = this.modalCtl.create(LocationFallbackScreen);
      this.ifOnFailure((action) => modal.onDidDismiss((_, __) => action()));
      await modal.present();

      throw new LocationAccessError("Can not use location: Permission Denied");
    }
  }
}

/**
 * Hardware requirement for wifi.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class WifiRequirement extends AbstractRequirement {

  constructor(
    private readonly modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil
  ) {super()}

  async check(): Promise<void> {
    throw new Error("This method is not implemented yet");
  }
}

/**
 * ANDROID ONLY!!!
 *
 * Hardware requirement for roaming service.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class RoamingRequirement extends AbstractRequirement {

  constructor(
    private readonly modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil
  ) {super()}

  async check(): Promise<void> {
    throw new Error("This method is not implemented yet");
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
    private readonly modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil,
    private readonly features: Array<HardwareFeature>
  ) {super()}

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
    private readonly modalCtl: ModalController,
    private readonly diagnosticUtil: DiagnosticUtil,
    private readonly features: Array<HardwareFeature>
  ) {super()}

  async check(): Promise<void> {
    throw new Error("This method is not implemented yet");
  }
}
