import { ChangeDetectorRef, Component, ElementRef, Inject, NgZone, OnDestroy, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MenuController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from "@ionic/angular";
import { forkJoin, ReplaySubject, Subject, of, BehaviorSubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MapComponent } from "src/app/components/map/map.component";
import { ILIASObject } from "src/app/models/ilias-object";
import { AuthenticationProvider } from "src/app/providers/authentication.provider";
import { Hardware } from "src/app/services/device/hardware-features/hardware-feature.service";
import { BlockModel, MapPlaceModel } from "src/app/services/learnplace/block.model";
import { BlockService, BLOCK_SERVICE } from "src/app/services/learnplace/block.service";
import { LearnplaceManagerImpl, LEARNPLACE_MANAGER } from "src/app/services/learnplace/learnplace.management";
import { VisitJournalWatch, VISIT_JOURNAL_WATCH } from "src/app/services/learnplace/visitjournal.service";
import { Logger } from "src/app/services/logging/logging.api";
import { Logging } from "src/app/services/logging/logging.service";
import { MapService, MAP_SERVICE } from "../../services/learnplace/map.service";


@Component({
  selector: "app-learnplace",
  templateUrl: "./learnplace.page.html",
  styleUrls: ["./learnplace.page.scss"],
})
export class LearnplacePage implements ViewWillEnter, ViewDidEnter, ViewDidLeave, OnDestroy {
    @ViewChild("map") elMap: MapComponent;
    @ViewChild("mapWrapper") elMapWrapper: Element;
    @ViewChild("content") elContent: ElementRef;

    ilObj: Subject<ILIASObject> = new Subject<ILIASObject>();
    menuItems: Subject<Array<ILIASObject>> = new Subject<Array<ILIASObject>>();
    mapPlaces: Array<MapPlaceModel>;
    displayMap: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    loadingBlocks: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    isEmptyBlock: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private readonly log: Logger = Logging.getLogger(LearnplacePage.name);
    private readonly dispose$: Subject<void> = new Subject<void>();
    readonly lastView: string;
    readonly blockList: ReplaySubject<Array<BlockModel>> = new ReplaySubject<Array<BlockModel>>(1);

    private currentBlockList: Array<BlockModel> = [];
    private objId: number = 0;

    constructor(
        @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
        @Inject(MAP_SERVICE) private readonly mapService: MapService,
        private readonly route: ActivatedRoute,
        private readonly hardware: Hardware,
        private readonly nav: NavController,
        private readonly zone: NgZone,
        private readonly detectorRef: ChangeDetectorRef,
        private readonly menu: MenuController,
        private readonly renderer: Renderer2,
        @Inject(VISIT_JOURNAL_WATCH) private readonly visitJournalWatch: VisitJournalWatch,
        @Inject(LEARNPLACE_MANAGER) private readonly lpManager: LearnplaceManagerImpl

    ) { }

    async ionViewWillEnter(): Promise<void> {
        await this.hardware.requireLocation()
            .onFailure(() => this.nav.pop())
            .check();

        const lpRefId: number = +this.route.snapshot.paramMap.get("refId");

        this.ilObj.subscribe(async (obj) => {
            this.visitJournalWatch.setLearnplace(obj.objId);
            this.visitJournalWatch.start();
            this.objId = obj.objId;



            await this.initLearnplaces(obj.parentRefId);
            this.initMenu();
            this.isEmptyBlock.next(true);
            this.initBlocks();
        });

        this.isEmptyBlock.subscribe(res => console.error("emptyblock: ", res));
        this.loadingBlocks.subscribe(res => console.error("is loading blocks: ", res))

        this.ilObj.next(await ILIASObject.findByRefIdAndUserId(lpRefId, AuthenticationProvider.getUser().id));
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

        this.destroyMap();
        this.mapPlaces = undefined;
    }

    ngOnDestroy(): void {
        this.ionViewDidLeave();
        this.dispose$.complete();
        this.blockList.complete();
    }

    async initMenu(): Promise<void> {
        const items: Array<ILIASObject> = [];
        this.lpManager.learnplaces.forEach(async id => {
            items.push(await ILIASObject.findByObjIdAndUserId(id, AuthenticationProvider.getUser().id))
        });

        this.menuItems.next(items);
    }

    async initLearnplaces(parentRefId: number): Promise<void> {
        if (this.mapPlaces)
            return;

        if (!this.lpManager?.learnplaces) {
            const lps: Array<ILIASObject> = (await ILIASObject.findByParentRefId(parentRefId, AuthenticationProvider.getUser().id))
                .filter(obj => obj.type === "xsrl")

            await this.lpManager.setLearnplaces(lps.map(lp => lp.objId));
        }

        forkJoin(this.mapService.getMapPlaces(this.lpManager.learnplaces)).subscribe(places => {
            this.mapPlaces = places;
        });
    }

    async initBlocks(): Promise<void> {
        await this.lpManager.loadBlocks(this.objId);
        this.isEmptyBlock.next(true);
        this.blockService.getBlockList(this.objId)
            .pipe(
                takeUntil(this.dispose$)
            ).subscribe(
                (it) => {
                    console.log("Block List: ", it);

                    if (it !== this.currentBlockList) {
                        this.zone.run(() => this.blockList.next(it));
                        this.currentBlockList = it;

                        this.isEmptyBlock.next(false);
                        this.loadingBlocks.next(false);
                        this.renderer.removeClass(this.elContent.nativeElement, "slide-out");
                        this.renderer.addClass(this.elContent.nativeElement, "slide-in");
                    }

                },
                (err) => {
                    console.error(err);
                },
                () => {
                    this.loadingBlocks.next(false);
                    this.renderer.removeClass(this.elContent.nativeElement, "slide-out");
                    this.renderer.addClass(this.elContent.nativeElement, "slide-in");
                }
            );
    }

    async openLearnplace(objId: number, map?: MapPlaceModel): Promise<void> {
        if (map) {
            objId = map.id;
            this.elMap.selectedPlace = map;
        } else
            this.mapService.getMapPlace(objId).subscribe(place => this.elMap.selectedPlace = place);

        await this.changeLearnplace(objId);
        await this.menu.close();
    }

    async changeLearnplace(objId: number): Promise<void> {
        if (objId === this.objId)
            return;

        this.loadingBlocks.next(true);
        this.isEmptyBlock.next(true);
        this.renderer.addClass(this.elContent.nativeElement, "slide-out");

        this.ilObj.next(await ILIASObject.findByObjIdAndUserId(objId, AuthenticationProvider.getUser().id));
    }

    async toggleMenu(): Promise<void> {
        await this.menu.open();
    }

    overview(): void {
        this.elMap.mapOverview();
    }

    destroyMap(): void {
        if (!!this.elMap) {
            while (this.elMap.elMap.firstChild) {
                this.elMap.elMap.removeChild(this.elMap.elMap.firstChild);
            }
        }
    }

    navigateBack(): void {
        // TODO: route into parentref, not to the last view
        this.nav.pop();
    }
}
