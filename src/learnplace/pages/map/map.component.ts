import {AfterViewInit, Component, Inject, OnDestroy} from "@angular/core";
import {CameraOptions, GeoCoordinate, MapBuilder, Marker} from "../../../services/map.service";
import {AlertController, AlertOptions, NavParams, Platform} from "ionic-angular";
import {MAP_SERVICE, MapService} from "../../services/map.service";
import {MapModel} from "../../services/block.model";
import {AlertButton} from "ionic-angular/components/alert/alert-options";
import {TranslateService} from "ng2-translate";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";

@Component({
    selector: "map",
    templateUrl: "map.html"
})
export class MapPage implements AfterViewInit, OnDestroy {

  private readonly learnplaceId: number;
  readonly title: string;

  private readonly log: Logger = Logging.getLogger(MapPage.name);

  constructor(
    private readonly platform: Platform,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly translate: TranslateService,
    private readonly alert: AlertController,
    params: NavParams
  ) {
    this.learnplaceId = params.get("learnplaceId");
    this.title = params.get("learnplaceName")
  }

  ngAfterViewInit(): void {
    this.platform.ready().then((): void => {this.init()})
  }


  ngOnDestroy(): void {
    this.mapService.shutdown();
  }

// // anoter FIX map not loading on tab change
  // ionViewDidLoad() {
  // setTimeout(() => {
  // this.mapService.getMap(this.learnplaceId);
  // }, 100);
  // }

  // //FIX map not loading on tab change
  // ionViewEnter() {
  // setTimeout(this.mapService.getMap(this.learnplaceId).bind(this), 100);
  // }

  async init(): Promise<void> {

    try {

      const map: MapModel = await this.mapService.getMap(this.learnplaceId);

      const builder: MapBuilder = new MapBuilder();

      const camera: CameraOptions = <CameraOptions>{
        zoom: map.zoom,
        position: <GeoCoordinate>{
          latitude: map.latitude,
          longitude: map.longitude
        }
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

    } catch (error) {
      this.log.warn(() => `Could not load map: error=${JSON.stringify(error)}`);
      this.showAlert(this.translate.instant("something_went_wrong"));
    }
  }

  private showAlert(message: string): void {
    this.alert.create(<AlertOptions>{
      title: message,
      buttons: [
        <AlertButton>{
          text: this.translate.instant("close"),
          role: "cancel"
        }
      ]
    }).present();
  }
}

export interface MapPageParams {
  readonly learnplaceId: number;
  readonly learnplaceName: string;
}
