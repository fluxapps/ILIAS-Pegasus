import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MenuController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from "@ionic/angular";
import { forkJoin, Observable, ReplaySubject, Subject, Subscription,  } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { ILIASObject } from "src/app/models/ilias-object";
import { AuthenticationProvider } from "src/app/providers/authentication.provider";
import { Hardware } from "src/app/services/device/hardware-features/hardware-feature.service";
import { BlockModel, MapPlaceModel } from "src/app/services/learnplace/block.model";
import { BlockService, BLOCK_SERVICE } from "src/app/services/learnplace/block.service";
import { LearnplaceManagerImpl, LEARNPLACE_MANAGER } from "src/app/services/learnplace/learnplace.management";
import { VisitJournalWatch, VISIT_JOURNAL_WATCH } from "src/app/services/learnplace/visitjournal.service";
import { Logger } from "src/app/services/logging/logging.api";
import { Logging } from "src/app/services/logging/logging.service";
import { CameraOptions, GeoCoordinate, Marker, MapService, MAP_SERVICE } from "../../services/learnplace/map.service";


@Component({
  selector: "app-learnplace",
  templateUrl: "./learnplace.page.html",
  styleUrls: ["./learnplace.page.scss"],
})
export class LearnplacePage implements ViewWillEnter, ViewDidEnter, ViewDidLeave, OnDestroy {
    // @ViewChild("map") mapElement: Element;

    title: string;
    map: MapPlaceModel | undefined = undefined;
    learnplaces: Array<number>
    mapPlaces: Array<MapPlaceModel>;
    selected: MapPlaceModel;

    private lpRefId: number;
    private lpObjId: number;
    private mapPlaceSubscription: Subscription | undefined = undefined;
    private readonly log: Logger = Logging.getLogger(LearnplacePage.name);
    private readonly dispose$: Subject<void> = new Subject<void>();
    readonly blockList: ReplaySubject<Array<BlockModel>> = new ReplaySubject<Array<BlockModel>>(1);

  constructor(
        @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
        @Inject(MAP_SERVICE) private readonly mapService: MapService,
        private readonly route: ActivatedRoute,
        private readonly hardware: Hardware,
        private readonly nav: NavController,
        private readonly zone: NgZone,
        private readonly detectorRef: ChangeDetectorRef,
        private readonly menu: MenuController,
        @Inject(VISIT_JOURNAL_WATCH) private readonly visitJournalWatch: VisitJournalWatch,
        @Inject(LEARNPLACE_MANAGER) private readonly lpManager: LearnplaceManagerImpl

  ) { }

    async ionViewWillEnter(): Promise<void> {
        await this.hardware.requireLocation()
            .onFailure(() => this.nav.pop())
            .check();

        this.lpRefId = +this.route.snapshot.paramMap.get("refId");

        const ilObj: ILIASObject = await ILIASObject.findByRefIdAndUserId(this.lpRefId, AuthenticationProvider.getUser().id);

        this.lpObjId = ilObj.objId;
        this.learnplaces = this.lpManager.learnplaces;
        console.error(this.lpObjId, this.lpRefId);
        this.title = ilObj.title;
        this.visitJournalWatch.setLearnplace(ilObj.objId);
        this.visitJournalWatch.start();

        this.blockService.getBlockList(ilObj.objId)
        .pipe(
            takeUntil(this.dispose$)
        ).subscribe((it) => {
            console.log("Block List: ", it);
            this.zone.run(() => this.blockList.next(it));
        });

        forkJoin(this.mapService.getMapPlaces(this.lpManager.learnplaces)).subscribe(places => {
            this.mapPlaces = places;
        });
        this.mapService.getMapPlace(this.lpObjId).subscribe(place => {
            this.selected = place;
        })
    }

    async ionViewDidEnter(): Promise<void> {
        this.detectorRef.detectChanges();
        await this.menu.enable(true);
    }

    ionViewDidLeave(): void {
        this.visitJournalWatch.stop();
        this.dispose$.next();
        this.blockService.shutdown();
        this.mapService.shutdown();
        if (this.mapPlaceSubscription) this.mapPlaceSubscription.unsubscribe();

        // if (!!this.mapElement) {
        //     while (this.mapElement.firstChild) {
        //         this.mapElement.removeChild(this.mapElement.firstChild);
        //     }
        // }
        this.mapPlaces = undefined;
    }

    ngOnDestroy(): void {
        this.ionViewDidLeave();
        this.dispose$.complete();
        this.blockList.complete();
    }

    async toggleMenu(): Promise<void> {
        console.error(await this.menu.getMenus());
        await this.menu.open();
    }
}
