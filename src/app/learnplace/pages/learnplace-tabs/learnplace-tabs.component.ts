import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MapPage, MapPageParams} from "../map/map.component";
import {ContentPage, ContentPageParams} from "../content/content.component";
import {NavController} from "@ionic/angular";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";

@Component({
    templateUrl: "learnplace-tabs.html",
})
export class LearnplaceTabsPage implements OnInit, OnDestroy {

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

    ionViewWillEnter(): void {//TODO lp runs
        this.title = LearnplaceTabsPage.mapPageParams.learnplaceName;
        this.visitJournalWatch.setLearnplace(LearnplaceTabsPage.mapPageParams.learnplaceObjectId);
        this.visitJournalWatch.start();
        this.ngOnInitTmp();
    }

    ngOnInit(): void { }

    ngOnInitTmp(): void {//TODO lp runs
        this.hardware.requireLocation()
            .onFailure(() => this.nav.pop())
            .check();
    }

    ngOnDestroy(): void {
        this.visitJournalWatch.stop();
    }
}

export interface TabsPageParams {
    readonly learnplaceObjectId: number;
    readonly learnplaceName: string;
}
