import { Component } from "@angular/core";
import {FooterToolbarService} from "../../../services/footer-toolbar.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {BrandingProvider} from "../../../providers/branding";

@Component({
  templateUrl: "synchronization.html"
})
export class SynchronizationPage {

  constructor(readonly footerToolbar: FooterToolbarService,
              private readonly theme: BrandingProvider) {

  }

}
