import { Component, Inject, NgZone, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ViewDidLeave, ViewWillEnter } from "ionic-lifecycle-interface";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ILIASObject } from "src/app/models/ilias-object";
import { AuthenticationProvider } from "src/app/providers/authentication.provider";
import { BlockModel } from "../../services/block.model";
import { BLOCK_SERVICE, BlockService } from "../../services/block.service";

@Component({
    templateUrl: "content.html",
    styleUrls: ["content.scss"]
})
export class ContentPage implements ViewWillEnter, ViewDidLeave, OnDestroy {

    private readonly dispose$: Subject<void> = new Subject<void>();
    readonly blockList: ReplaySubject<Array<BlockModel>> = new ReplaySubject<Array<BlockModel>>(1);

    constructor(
        @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
        private readonly zone: NgZone,
        private readonly route: ActivatedRoute,
    ) { }

    async ionViewWillEnter(): Promise<void> {
        const lpRefId: number = Number.parseInt(this.route.snapshot.parent.parent.paramMap.get("refId"));
        const ilObj: ILIASObject = await ILIASObject.findByRefIdAndUserId(lpRefId, AuthenticationProvider.getUser().id);

        // we detect property changes, when a block list is emitted to update the UI with the new block list
        this.blockService.getBlockList(ilObj.objId)
            .pipe(
                takeUntil(this.dispose$)
            ).subscribe((it) => {
                console.log("Block List: ", it);
                this.zone.run(() => this.blockList.next(it));
        });
    }

    // Ionic won't call this callback if the entire learnplace tab nav gets popped.
    ionViewDidLeave(): void {
        this.dispose$.next();
        this.blockService.shutdown();
    }

    ngOnDestroy(): void {
        this.ionViewDidLeave();
        this.dispose$.complete();
        this.blockList.complete();
    }
}
