/** angular */
import {Component} from "@angular/core";
import {NavController} from "@ionic/angular";
/** misc */
import {Hardware} from "../../services/device/hardware-features/hardware-feature.service";

@Component({
  templateUrl: "test-hardware-feature.html"
})
export class HardwareFeaturePage {

  constructor(
    private readonly nav: NavController,
    private readonly hardware: Hardware
  ) {}

  locationWithCallback(): Promise<void> {
    this.hardware.requireLocation()
      .onFailure(() => this.nav.pop())
      .check();
    return Promise.resolve();
  }

  location(): Promise<void> {
    this.hardware.requireLocation()
      .check();
    return Promise.resolve();
  }
}
