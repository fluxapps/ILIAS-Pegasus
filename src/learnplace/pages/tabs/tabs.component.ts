import {Component} from "@angular/core";
import {MapPage} from "../map/map.component";
import {LEARNPLACE_REPOSITORY, TypeORMLearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {MAP_REPOSITORY, TypeORMMapRepository} from "../../providers/repository/map.repository";
import {LEARNPLACE_LOADER, RestLearnplaceLoader} from "../../services/learnplace";

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
    },
    {
      provide: LEARNPLACE_LOADER,
      useClass: RestLearnplaceLoader
    }
  ]
})
export class TabsPage {

  readonly mapPage: object = MapPage;

}
