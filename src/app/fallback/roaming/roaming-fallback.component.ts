import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic/ngx";
import {ModalController} from "@ionic/angular";

@Component({
  templateUrl: "roaming-fallbackscreen.html"
})
export class RoamingFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly modalCtrl: ModalController
  ) {}

  async switchToRoamingService(): Promise<void> {
    this.diagnostic.switchToMobileDataSettings();
    await this.close();
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }
}
