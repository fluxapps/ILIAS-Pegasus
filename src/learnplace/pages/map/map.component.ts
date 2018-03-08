import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {CameraOptions, GeoCoordinate, MapBuilder, Marker} from "../../../services/map.service";
import {AlertController, AlertOptions, NavParams, Platform} from "ionic-angular";
import {MAP_SERVICE, MapService} from "../../services/map.service";
import {MapModel} from "../../services/block.model";
import {AlertButton} from "ionic-angular/components/alert/alert-options";
import {TranslateService} from "ng2-translate";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";

@Component({
    selector: "map",
    templateUrl: "map.html"
})
export class MapPage implements AfterViewInit, OnDestroy {

  private readonly learnplaceId: number;
  readonly title: string;

  mapModel: Observable<MapModel> | undefined = undefined;

  map: MapModel | undefined = undefined;

  private mapsubscription: Subscription | undefined = undefined;

  private readonly log: Logger = Logging.getLogger(MapPage.name);

  constructor(
    private readonly platform: Platform,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly translate: TranslateService,
    private readonly alert: AlertController,
    private readonly detectorRef: ChangeDetectorRef,
    params: NavParams
  ) {
    this.learnplaceId = params.get("learnplaceId");
    this.title = params.get("learnplaceName")
  }

  ngAfterViewInit(): void {

    // TODO: catch error
    this.mapsubscription = this.mapService.getMap(this.learnplaceId).subscribe(async(it) => {

      this.map = it;

      this.detectorRef.detectChanges();

      if(it.visible) {
        const builder: MapBuilder = new MapBuilder();

        const camera: CameraOptions = <CameraOptions>{
          zoom: it.zoom,
          position: <GeoCoordinate>{
            latitude: it.latitude,
            longitude: it.longitude
          }
        };

        const marker: Marker = <Marker>{
          position: <GeoCoordinate>{
            latitude: it.latitude, longitude: it.longitude
          },
          title: this.title
        };

        await builder
          .camera(camera)
          .marker(marker)
          .bind("map")
          .build();
      }
    });
  }

  ngOnDestroy(): void {
    this.mapService.shutdown();
    this.mapsubscription.unsubscribe();
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
