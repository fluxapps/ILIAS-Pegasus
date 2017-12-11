


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
      longitude: 43.0741904,
      latitude: -89.3809802
    };

    const mapCanvas: HTMLElement = document.getElementById('map');

    await builder
      .camera(camera)
      .bind("map")
      .build();
  }
}
