/** angular */
import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";
/** ionic-native */
import {Diagnostic} from "@ionic-native/diagnostic/ngx";

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
