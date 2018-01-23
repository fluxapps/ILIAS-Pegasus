import {ModalController} from "ionic-angular";
import {Diagnostic} from "@ionic-native/diagnostic";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {NoSuchElementError} from "../../../error/errors";
import {Injectable} from "@angular/core";

/**
 * Contains injectable providers that are used in a hardware feature decorator.
 *
 * This class is very special and is only needed in order to enable the functionality
 * of the hardware feature decorators.
 *
 * This class acts as a container with static accessibility to providers used of a decorator.
 * It MUST NOT be used to make providers available to other classes, functions etc.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class HardwareFeatureResources {

  private static modalController: ModalController | undefined = undefined;
  private static diagnosticPlugin: Diagnostic | undefined = undefined;

  constructor(
    private readonly modalController: ModalController,
    private readonly diagnostic: Diagnostic
  ) {}

  /**
   * @returns {ModalController} the modal controller if set
   * @throws {NoSuchElementError} if the modal controller is not set
   */
  static modalCtrl(): ModalController {
    if (isUndefined(HardwareFeatureResources.modalController)) {
      throw new NoSuchElementError("modalCtrl is not set. Be sure to setup HardwareFeatureResources properly");
    }
    return HardwareFeatureResources.modalController;
  }

  /**
   * @returns {Diagnostic} the diagnostic if set
   * @throws {NoSuchElementError} if the diagnostic is not set
   */
  static diagnostic(): Diagnostic {
    if (isUndefined(HardwareFeatureResources.diagnosticPlugin)) {
      throw new NoSuchElementError("diagnostic is not set. Be sure to setup HardwareFeatureResources properly");
    }
    return HardwareFeatureResources.diagnosticPlugin;
  }

  /**
   * Sets up this class by assigning the instance variables of this class to its static declaration.
   */
  setup(): void {
    HardwareFeatureResources.modalController = this.modalController;
    HardwareFeatureResources.diagnosticPlugin = this.diagnostic;
  }
}
