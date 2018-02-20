import {Component} from "@angular/core";
import {MapPage, MapPageParams} from "../map/map.component";
import {ContentPage, ContentPageParams} from "../content/content.component";
import {NavParams} from "ionic-angular";

@Component({
  templateUrl: "tabs.html",
})
export class TabsPage {

  readonly mapPage: object = MapPage;
  readonly mapPageParams: MapPageParams;

  readonly contentPage: object = ContentPage;
  readonly contentPageParams: ContentPageParams;

  constructor(
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

}

export interface TabsPageParams {
  readonly learnplaceId: number;
  readonly learnplaceName: string;
}
