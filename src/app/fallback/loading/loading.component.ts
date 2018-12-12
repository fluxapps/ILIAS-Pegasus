import {Component} from "@angular/core";
import {FooterToolbarService} from "../../../services/footer-toolbar.service";
import {BrandingProvider} from "../../../providers/branding";

@Component({
    templateUrl: "loading.html"
})
export class LoadingPage {

    constructor(
        readonly footerToolbar: FooterToolbarService,
        private readonly theme: BrandingProvider
    ) {}
}
