import {Component, Inject, OnDestroy} from "@angular/core";
import {NavController} from "@ionic/angular";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";
import {ObjectListPage} from "../../../pages/object-list/object-list";
import {LearnplaceNavParams} from "./learnplace.nav-params";
import { ViewWillEnter } from "ionic-lifecycle-interface";

@Component({
    templateUrl: "learnplace-tabs.html",
})
export class LearnplaceTabsPage implements ViewWillEnter, OnDestroy {

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
