/** angular */
import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
/** services */
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";
/** misc */
import {MapPage, MapPageParams} from "../map/map.component";
import {ContentPage, ContentPageParams} from "../content/content.component";

@Component({
  templateUrl: "tabs.html",
})
export class TabsPage implements OnInit, OnDestroy {

  readonly mapPage: object = MapPage;
  readonly mapPageParams: MapPageParams;

  readonly contentPage: object = ContentPage;
  readonly contentPageParams: ContentPageParams;

  readonly title: string;

  constructor(
    private readonly hardware: Hardware,
    private readonly nav: NavController,
    @Inject(VISIT_JOURNAL_WATCH) private readonly visitJournalWatch: VisitJournalWatch,
    params: NavParams
  ) {
    const learnplaceObjectId: number = params.get("learnplaceObjectId");
    const learnplaceName: string = params.get("learnplaceName");

    this.mapPageParams = <MapPageParams>{
      learnplaceObjectId: learnplaceObjectId,
      learnplaceName: learnplaceName
    };
    this.contentPageParams = <ContentPageParams>{
      learnplaceId: learnplaceObjectId,
      learnplaceName: learnplaceName
    };

    this.title = learnplaceName;

    this.visitJournalWatch.setLearnplace(learnplaceObjectId);
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
  readonly learnplaceObjectId: number;
  readonly learnplaceName: string;
}
