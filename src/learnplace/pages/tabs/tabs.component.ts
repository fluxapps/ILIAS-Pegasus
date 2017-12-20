import {Component} from "@angular/core";
import {MapPage} from "../map/map.component";
import {LEARNPLACE_REPOSITORY, TypeORMLearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {MAP_REPOSITORY, TypeORMMapRepository} from "../../providers/repository/map.repository";

@Component({
  templateUrl: "tabs.html",
  providers: [
    {
      provide: LEARNPLACE_REPOSITORY,
      useClass: TypeORMLearnplaceRepository
    },
    {
      provide: MAP_REPOSITORY,
      useClass: TypeORMMapRepository
    }
  ]
})
export class TabsPage {

  readonly mapPage: object = MapPage;

}
