import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {Location} from "@angular/common";

@Component({
  templateUrl: "location-fallbackscreen.html"
})
export class LocationFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly location: Location
  ) {}

  switchToLocation(): void {
    this.diagnostic.switchToLocationSettings();
    this.location.back();
  }
}
