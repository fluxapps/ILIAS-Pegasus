import {AfterViewInit, Component, Inject} from "@angular/core";
import {GeoCoordinate, MapBuilder, Marker} from "../../../services/map.service";
import {Platform} from "ionic-angular";
import {MAP_SERVICE, MapService} from "../../services/map.service";
import {MapModel} from "../../services/block.model";
import {LEARNPLACE, LearnplaceData} from "../../services/learnplace";

/**
 * Component to display a map view.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.3
 */
@Component({
    selector: "map",
    templateUrl: "map.html"
})
export class MapPage implements AfterViewInit{

  constructor(
    private readonly platform: Platform,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    @Inject(LEARNPLACE) private readonly learnplace: LearnplaceData
  ) {}

  ngAfterViewInit(): void {

    this.platform.ready().then((): void => {this.init()})
  }

  async init(): Promise<void> {

    const map: MapModel = await this.mapService.getMap(this.learnplace.getId());

    const builder: MapBuilder = new MapBuilder();

    const camera: GeoCoordinate = <GeoCoordinate>{
      latitude: map.latitude,
      longitude: map.longitude
    };

    const marker: Marker = <Marker>{
      position: <GeoCoordinate>{
        latitude: map.latitude, longitude: map.longitude
      },
      title: map.title
    };

    await builder
      .camera(camera)
      .marker(marker)
      .bind("map")
      .build();
  }
}
