import {Component} from "@angular/core";
import {MapPage} from "../map/map.component";
import {ContentPage} from "../content/content.component";

@Component({
  templateUrl: "tabs.html",
})
export class TabsPage {
  readonly mapPage: object = MapPage;
  readonly contentPage: object = ContentPage;
}
