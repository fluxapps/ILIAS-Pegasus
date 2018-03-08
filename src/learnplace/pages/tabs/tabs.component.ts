import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MapPage, MapPageParams} from "../map/map.component";
import {ContentPage, ContentPageParams} from "../content/content.component";
import {NavController, NavParams} from "ionic-angular";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";

@Component({
  templateUrl: "tabs.html",
})
export class TabsPage implements OnInit, OnDestroy {

  readonly mapPage: object = MapPage;
  readonly mapPageParams: MapPageParams;

  readonly contentPage: object = ContentPage;
  readonly contentPageParams: ContentPageParams;

  constructor(
    private readonly hardware: Hardware,
    private readonly nav: NavController,
    @Inject(VISIT_JOURNAL_WATCH) private readonly visitJournalWatch: VisitJournalWatch,
    params: NavParams
  ) {
    const learnplaceId: number = params.get("learnplaceId");
    const learnplaceName: string = params.get("learnplaceName");

    this.mapPageParams = <MapPageParams>{
      learnplaceId: learnplaceId,
      learnplaceName: learnplaceName
    };
    this.contentPageParams = <ContentPageParams>{
      learnplaceId: learnplaceId,
      learnplaceName: learnplaceName
    };

    this.visitJournalWatch.setLearnplace(learnplaceId);
    this.visitJournalWatch.start();
  }

  ngOnInit(): void {
    this.hardware.requireLocation()
      .onFailure(() => this.nav.pop())
      .check();
  }

  ngOnDestroy(): void {
    this.visitJournalWatch.stop();
  }
}

export interface TabsPageParams {
  readonly learnplaceId: number;
  readonly learnplaceName: string;
}
