import {Component} from "@angular/core";
import {MapPage} from "../map/map.component";

@Component({
  templateUrl: "tabs.html",
})
export class TabsPage {
  readonly mapPage: object = MapPage;
}
