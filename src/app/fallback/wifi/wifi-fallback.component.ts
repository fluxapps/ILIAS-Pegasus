import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {Location} from "@angular/common";

@Component({
  templateUrl: "wifi-fallbackscreen.html"
})
export class WifiFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly location: Location
  ) {}

  switchToWifi(): void {
    this.diagnostic.switchToWifiSettings();
    this.location.back();
  }
}
