import {Component} from "@angular/core";
import {FooterToolbarService} from "../../../services/footer-toolbar.service";

@Component({
  templateUrl: "synchronization.html"
})
export class SynchronizationPage {

  constructor(
      readonly footerToolbar: FooterToolbarService
  ) {

  }

}
