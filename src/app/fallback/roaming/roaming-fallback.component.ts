import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {Location} from "@angular/common";

@Component({
  templateUrl: "roaming-fallbackscreen.html"
})
export class RoamingFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly location: Location
  ) {}

  switchToRoamingService(): void {
    this.diagnostic.switchToMobileDataSettings();
    this.location.back();
  }
}
