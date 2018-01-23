import {Component} from "@angular/core";
import {RequireAll, RequireAny, RequireLocation, RequireWifi} from "../../services/device/hardware-features/decorators";
import {HardwareFeature} from "../../services/device/hardware-features/diagnostics.util";

@Component({
  templateUrl: "test-hardware-feature.html"
})
export class HardwareFeaturePage {

  @RequireWifi
  wifi(): Promise<void> {
    return Promise.resolve();
  }

  @RequireLocation
  location(): Promise<void> {
    return Promise.resolve();
  }

  @RequireAll(HardwareFeature.WIFI, HardwareFeature.LOCATION)
  all(): Promise<void> {
    return Promise.resolve();
  }

  @RequireAny(HardwareFeature.LOCATION, HardwareFeature.WIFI)
  any(): Promise<void> {
    return Promise.resolve();
  }
}
