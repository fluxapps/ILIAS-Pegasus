import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {ViewController} from "ionic-angular";

@Component({
  templateUrl: "location-fallbackscreen.html"
})
export class LocationFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly viewCtrl: ViewController
  ) {}

  async switchToLocation(): Promise<void> {
    this.diagnostic.switchToSettings();
    await this.close();
  }

  async close(): Promise<void> {
    await this.viewCtrl.dismiss();
  }
}
