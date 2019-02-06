import {Component} from "@angular/core";
import {FooterToolbarService} from "../../../services/footer-toolbar.service";
import {ThemeProvider} from "../../../providers/theme";

@Component({
    templateUrl: "loading.html"
})
export class LoadingPage {

    constructor(
        readonly footerToolbar: FooterToolbarService,
        readonly theme: ThemeProvider
    ) {}
}
