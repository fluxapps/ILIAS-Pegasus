import {Component, Inject, OnDestroy} from "@angular/core";
import {ContentPage} from "../content/content.component";
import {NavController} from "@ionic/angular";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";
import {ObjectListPage} from "../../../pages/object-list/object-list";
import {LearnplaceNavParams} from "./learnplace.nav-params";

@Component({
    templateUrl: "learnplace-tabs.html",
})
export class LearnplaceTabsPage implements OnDestroy {
    readonly contentPage: object = ContentPage;

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

    ngOnDestroy(): void {
        this.visitJournalWatch.stop();
    }

    closeLearnplace(): void {
        ObjectListPage.navigateBackToObjectList(this.nav);
    }
}
