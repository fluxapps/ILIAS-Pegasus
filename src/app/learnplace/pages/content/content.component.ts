import { Component, Inject, NgZone, OnDestroy } from "@angular/core";
import { ViewDidLeave, ViewWillEnter } from "ionic-lifecycle-interface";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BlockModel } from "../../services/block.model";
import { BLOCK_SERVICE, BlockService } from "../../services/block.service";
import { LearnplaceNavParams } from "../learnplace-tabs/learnplace.nav-params";

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
    ) { }

    ionViewWillEnter(): void {
        // we detect property changes, when a block list is emitted to update the UI with the new block list
        this.blockService.getBlockList(LearnplaceNavParams.learnplaceObjectId)
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
