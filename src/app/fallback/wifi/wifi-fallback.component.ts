import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {ViewController} from "ionic-angular";

@Component({
  templateUrl: "wifi-fallbackscreen.html"
})
export class WifiFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly viewCtrl: ViewController
  ) {}

  async switchToWifi(): Promise<void> {
    this.diagnostic.switchToWifiSettings();
    await this.close()
  }

  async close(): Promise<void> {
    await this.viewCtrl.dismiss();
  }
}
