import {Component, Inject} from "@angular/core";
import {IonicPage, NavController} from "ionic-angular";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {ILIASInstallation} from "../../config/ilias-config";
import {BrandingProvider} from "../../providers/branding";
import {Builder} from "../../services/builder.base";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";

/**
 * Generated class for the DesktopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-desktop",
  templateUrl: "desktop.html",
})
export class DesktopPage {

  readonly installations: Array<ILIASInstallation> = [];

  constructor(
      public navCtrl: NavController,
      private readonly theme: BrandingProvider,
      @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
      private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
      @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder
  ) { }

  async switchTabs(tab: number): Promise<void> {
      this.navCtrl.parent.select(tab);
  }

  //Open repo in Browser inApp for iOS, external for Android
  async openILIASRepository(): Promise<void>{
      const REFID_REPOSITORY: number = 1;
      this.openInIliasActionFactory(undefined, this.linkBuilder.default().target(REFID_REPOSITORY)).execute();
  }

}
