/** angular */
import { Component, Inject } from "@angular/core";
import { NavController } from "@ionic/angular";
/** misc */
import { OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction } from "../../actions/open-object-in-ilias-action";
import { ThemeProvider } from "../../providers/theme/theme.provider";
/** services */
import { Builder } from "../../services/builder.base";
import { LINK_BUILDER, LinkBuilder } from "../../services/link/link-builder.service";

/**
 * Generated class for the DesktopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: "page-desktop",
    templateUrl: "desktop.html",
})
export class DesktopPage {

    private readonly REF_ID_REPOSITORY: number = 1;

    constructor(
        private readonly navCtrl: NavController,
        @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
        private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
        @Inject(LINK_BUILDER)
        private readonly linkBuilder: LinkBuilder
    ) {}

    // count the number of loaded SVGs and set theme once all of them are loaded
    async svgLoaded(): Promise<void> {
        await ThemeProvider.setCustomColor();
    }

    // navigate to a tab
    async navigateTo(url: string): Promise<void> {
        await this.navCtrl.navigateForward(`tabs/${url}`);
    }

    // open repo in Browser inApp for iOS, external for Android
    async openILIASRepository(): Promise<void> {
        await this.openInIliasActionFactory(undefined, this.linkBuilder.default().target(this.REF_ID_REPOSITORY)).execute();
    }

}
