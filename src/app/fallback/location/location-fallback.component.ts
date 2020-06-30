import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic/ngx";
import {ModalController} from "@ionic/angular";

@Component({
  templateUrl: "location-fallbackscreen.html"
})
export class LocationFallbackScreen {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly modalCtrl: ModalController
  ) {}

  async switchToLocation(): Promise<void> {
    this.diagnostic.switchToSettings();
    await this.close();
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }
}
