import {AfterViewInit, Component} from "@angular/core";
import {GeoCoordinate, MapBuilder, Marker} from "../../../services/map.service";
import {Platform} from "ionic-angular";

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

  constructor(
    private readonly platform: Platform
  ) {}

  ngAfterViewInit(): void {

    this.platform.ready().then((): void => {this.init()})
  }

  async init(): Promise<void> {

    const builder: MapBuilder = new MapBuilder();

    const camera: GeoCoordinate = <GeoCoordinate>{
      latitude: 47.059819,
      longitude: 7.624037
    };

    const marker: Marker = <Marker>{
      position: <GeoCoordinate>{
        latitude: 47.059819, longitude: 7.624037
      },
      title: "A marker is here"
    };

    await builder
      .camera(camera)
      .marker(marker)
      .bind("map")
      .build();
  }
}
