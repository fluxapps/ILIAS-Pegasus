/** angular */
import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";
/** ionic-native */
import {Diagnostic} from "@ionic-native/diagnostic/ngx";

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
