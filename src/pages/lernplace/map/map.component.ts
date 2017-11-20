


import {AfterViewInit, Component} from "@angular/core";
import {GeoCoordinate, MapBuilder} from "../../../services/map.service";

/**
 * Component to display a map view.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Component({
    selector: "map",
    templateUrl: "map.html"
})
export class MapPage implements AfterViewInit{

  ngAfterViewInit(): void {
    this.init();
  }

  async init(): Promise<void> {

    const builder: MapBuilder = new MapBuilder();

    const camera: GeoCoordinate = <GeoCoordinate>{
      longitude: 20,
      latitude: 20
    };

    await builder
      .camera(camera)
      .bind("map")
      .build();
  }
}
