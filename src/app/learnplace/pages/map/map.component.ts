import { ChangeDetectorRef, Component, Inject, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {ViewDidLeave, ViewWillEnter, ViewDidEnter} from "ionic-lifecycle-interface";
import {Subscription} from "rxjs";
import { ILIASObject } from "src/app/models/ilias-object";
import { AuthenticationProvider } from "src/app/providers/authentication.provider";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {CameraOptions, GeoCoordinate, MapBuilder, Marker} from "../../../services/map.service";
import {MapModel} from "../../services/block.model";
import {MAP_SERVICE, MapService} from "../../services/map.service";

@Component({
    selector: "map",
    templateUrl: "map.html",
    styleUrls: ["map.scss"]
})
export class MapPage implements ViewWillEnter, ViewDidEnter, ViewDidLeave, OnDestroy {

    @ViewChild("map") mapElement: Element;

    private learnplaceObjectId: number;
    private lpRefId: number;
    title: string;

    map: MapModel | undefined = undefined;

    private mapSubscription: Subscription | undefined = undefined;

    private readonly log: Logger = Logging.getLogger(MapPage.name);

    constructor(
        @Inject(MAP_SERVICE) private readonly mapService: MapService,
        private readonly detectorRef: ChangeDetectorRef,
        private readonly route: ActivatedRoute,
    ) { }

    async ionViewWillEnter(): Promise<void> {
        this.lpRefId = Number.parseInt(this.route.snapshot.parent.parent.paramMap.get("refId"));
        const ilObj: ILIASObject = await ILIASObject.findByRefIdAndUserId(this.lpRefId, AuthenticationProvider.getUser().id);
        this.learnplaceObjectId = ilObj.objId;
        this.title = ilObj.title;

        this.mapSubscription = this.mapService.getMap(this.learnplaceObjectId)
            .subscribe({
                next: this.init.bind(this),
                error: (error): void => {
                    this.log.error(() => Logging.getMessage(error, "Map could not be initialized"));
                    this.log.error(() => `Error during map initialization: ${JSON.stringify(error)}`);
                }
            });
    }

    ionViewDidEnter(): void {
        this.detectorRef.detectChanges();
    }

    // Ionic won't call this callback if the entire learnplace tab nav gets popped.
    ionViewDidLeave(): void {
        this.mapService.shutdown();
        this.mapSubscription.unsubscribe();
        if (!!this.mapElement) {
            while (this.mapElement.firstChild) {
                this.mapElement.removeChild(this.mapElement.firstChild);
            }
        }
        this.mapSubscription = undefined;
    }

    ngOnDestroy(): void {
        // workaround
        if (this.mapSubscription !== undefined) {
            this.ionViewDidLeave();
        }
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
