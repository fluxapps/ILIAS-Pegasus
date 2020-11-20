/** angular */
import { Component, Inject } from "@angular/core";
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
    styleUrls: ["desktop.scss"]
})
export class DesktopPage {

    private readonly REF_ID_REPOSITORY: number = 1;

    constructor(
        @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
        private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
        @Inject(LINK_BUILDER)
        private readonly linkBuilder: LinkBuilder,
        private themeProvider: ThemeProvider
    ) {}

    // count the number of loaded SVGs and set theme once all of them are loaded
    async svgLoaded(): Promise<void> {
        await this.themeProvider.setCustomColor();
    }

    // open repo in Browser inApp for iOS, external for Android
    async openILIASRepository(): Promise<void> {
        await this.openInIliasActionFactory(undefined, this.linkBuilder.default().target(this.REF_ID_REPOSITORY)).execute();
    }

}
