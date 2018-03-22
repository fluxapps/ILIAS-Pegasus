import {Component} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {ViewController} from "ionic-angular";
import {FooterToolbarService, Job} from "../../../services/footer-toolbar.service";

@Component({
  templateUrl: "loading.html"
})
export class LoadingPage {

  constructor(
    private readonly diagnostic: Diagnostic,
    private readonly viewCtrl: ViewController,
    readonly footerToolbar: FooterToolbarService,
  ) {}

  async switchToLocation(): Promise<void> {
    this.diagnostic.switchToSettings();
    await this.close();
  }

  async close(): Promise<void> {
    await this.viewCtrl.dismiss();
  }
}
