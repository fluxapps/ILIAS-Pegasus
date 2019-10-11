import {Component, OnInit} from "@angular/core";
import {NavController} from "@ionic/angular";

@Component({
    selector: "app-tabs",
    templateUrl: "./tabs.page.html",
    styleUrls: ["./tabs.page.scss"],
})
export class TabsPage implements OnInit {
    constructor(
        private readonly navCtrl: NavController
    ) {}

    // navigate to a tab
    async navigateTo(url: string): Promise<void> {
        await this.navCtrl.navigateForward(`tabs/${url}`);
    }

    ngOnInit(): void {
        return;
    }
}
