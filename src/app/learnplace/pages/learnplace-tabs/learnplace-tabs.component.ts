import {Component, Inject, OnDestroy} from "@angular/core";
import {MapPageParams} from "../map/map.component";
import {ContentPage, ContentPageParams} from "../content/content.component";
import {NavController} from "@ionic/angular";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";
import {ObjectListPage} from "../../../pages/object-list/object-list";

@Component({
    templateUrl: "learnplace-tabs.html",
})
export class LearnplaceTabsPage implements OnDestroy {

    static mapPageParams: MapPageParams;
    static contentPageParams: ContentPageParams;

    readonly contentPage: object = ContentPage;

    title: string;

    constructor(
        private readonly hardware: Hardware,
        private readonly nav: NavController,
        @Inject(VISIT_JOURNAL_WATCH) private readonly visitJournalWatch: VisitJournalWatch,
    ) { }

    static setNavParams(learnplaceObjectId: number, learnplaceName: string): void {
        LearnplaceTabsPage.mapPageParams = <MapPageParams>{
            learnplaceObjectId: learnplaceObjectId,
            learnplaceName: learnplaceName
        };

        LearnplaceTabsPage.contentPageParams = <ContentPageParams>{
            learnplaceId: learnplaceObjectId,
            learnplaceName: learnplaceName
        };
    }

    ionViewWillEnter(): void {
        this.title = LearnplaceTabsPage.mapPageParams.learnplaceName;
        this.visitJournalWatch.setLearnplace(LearnplaceTabsPage.mapPageParams.learnplaceObjectId);
        this.visitJournalWatch.start();
        this.hardware.requireLocation()
            .onFailure(() => this.nav.pop())
            .check();
    }

    ngOnDestroy(): void {
        this.visitJournalWatch.stop();
    }

    private closeLearnplace(): void {
        ObjectListPage.navigateBackToObjectList(this.nav);
    }
}

export interface TabsPageParams {
    readonly learnplaceObjectId: number;
    readonly learnplaceName: string;
}
