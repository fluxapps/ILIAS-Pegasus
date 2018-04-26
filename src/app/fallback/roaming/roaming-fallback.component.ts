import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {ViewController} from "ionic-angular";

@Component({
  templateUrl: "roaming-fallbackscreen.html"
})
export class RoamingFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly viewCtrl: ViewController
  ) {}

  async switchToRoamingService(): Promise<void> {
    this.diagnostic.switchToMobileDataSettings();
    await this.close();
  }

  async close(): Promise<void> {
    await this.viewCtrl.dismiss();
  }
}
