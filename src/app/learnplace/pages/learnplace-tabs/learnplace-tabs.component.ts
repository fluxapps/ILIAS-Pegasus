import {Component, Inject} from "@angular/core";
import {NavController} from "@ionic/angular";
import {ViewDidLeave, ViewWillEnter} from "ionic-lifecycle-interface";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";
import {LearnplaceNavParams} from "./learnplace.nav-params";

@Component({
    templateUrl: "learnplace-tabs.html",
    styleUrls: ["learnplace-tabs.scss"]
})
export class LearnplaceTabsPage implements ViewWillEnter, ViewDidLeave {

    title: string;

    constructor(
        private readonly hardware: Hardware,
        private readonly nav: NavController,
        @Inject(VISIT_JOURNAL_WATCH) private readonly visitJournalWatch: VisitJournalWatch,
    ) { }

    ionViewWillEnter(): void {
        this.title = LearnplaceNavParams.learnplaceName;
        this.visitJournalWatch.setLearnplace(LearnplaceNavParams.learnplaceObjectId);
        this.visitJournalWatch.start();
        this.hardware.requireLocation()
            .onFailure(() => this.nav.pop())
            .check();
    }

    ionViewDidLeave(): void {
        this.visitJournalWatch.stop();
    }
}
