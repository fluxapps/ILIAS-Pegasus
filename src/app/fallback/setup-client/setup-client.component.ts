import {Component} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: "setup-client.html"
})
export class SetupClientPage {

  constructor(
      private readonly translate: TranslateService
  ) {}

}
