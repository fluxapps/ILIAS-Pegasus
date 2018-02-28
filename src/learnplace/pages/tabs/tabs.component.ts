import {AfterViewInit, Component} from "@angular/core";
import {MapPage, MapPageParams} from "../map/map.component";
import {ContentPage, ContentPageParams} from "../content/content.component";
import {NavController, NavParams} from "ionic-angular";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";

@Component({
  templateUrl: "tabs.html",
})
export class TabsPage implements AfterViewInit {

  readonly mapPage: object = MapPage;
  readonly mapPageParams: MapPageParams;

  readonly contentPage: object = ContentPage;
  readonly contentPageParams: ContentPageParams;

  constructor(
    private readonly hardware: Hardware,
    private readonly nav: NavController,
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
    }
  }
  
  ngAfterViewInit(): void {
    this.hardware.requireLocation()
      .onFailure(() => this.nav.pop())
      .check();
  }
}

export interface TabsPageParams {
  readonly learnplaceId: number;
  readonly learnplaceName: string;
}
