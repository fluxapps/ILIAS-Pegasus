import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, ViewChild} from "@angular/core";
import {CameraOptions, GeoCoordinate, MapBuilder, Marker} from "../../../services/map.service";
import {AlertController, AlertOptions, NavParams, Content} from "ionic-angular";
import {MAP_SERVICE, MapService} from "../../services/map.service";
import {MapModel} from "../../services/block.model";
import {AlertButton} from "ionic-angular/components/alert/alert-options";
import {TranslateService} from "ng2-translate";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: "map",
    templateUrl: "map.html"
})
export class MapPage implements AfterViewInit, OnDestroy {

  private readonly learnplaceObjectId: number;
  readonly title: string;
  @ViewChild("content")
  content: Content

  map: MapModel | undefined = undefined;

  private mapSubscription: Subscription | undefined = undefined;

  private readonly log: Logger = Logging.getLogger(MapPage.name);

  constructor(
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly translate: TranslateService,
    private readonly alert: AlertController,
    private readonly detectorRef: ChangeDetectorRef,
    params: NavParams
  ) {
    this.learnplaceObjectId = params.get("learnplaceObjectId");
    this.title = params.get("learnplaceName")
  }

  ngAfterViewInit(): void {
console.log(this.learnplaceObjectId);
    this.mapSubscription = this.mapService.getMap(this.learnplaceObjectId)
      .subscribe(
        this.init.bind(this),
        error => {

        this.log.error(() => Logging.getMessage(error, "Map could not be initialized"));
        this.log.debug(() => `Error during map initialization: ${JSON.stringify(error)}`);
    });

    this.content.resize();
  }

  ngOnDestroy(): void {
    this.mapService.shutdown();
    this.mapSubscription.unsubscribe();
  }

  private async init(map: MapModel): Promise<void> {

    this.map = map;

    this.detectorRef.detectChanges();

    /*
     * Only build map if its visible.
     * Otherwise the builder will fail, because there
     * is no html element to bind.
     */
    if(map.visible) {
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
        title: this.title
      };

      await builder
        .camera(camera)
        .marker(marker)
        .bind("map")
        .build();
    }
  }
}

export interface MapPageParams {
  readonly learnplaceObjectId: number;
  readonly learnplaceName: string;
}
