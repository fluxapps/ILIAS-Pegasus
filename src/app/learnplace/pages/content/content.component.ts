import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from "@angular/core";
import {ViewDidLeave, ViewWillEnter, ViewDidEnter} from "ionic-lifecycle-interface";
import {NEVER, Observable} from "rxjs";
import {shareReplay, tap} from "rxjs/operators";
import {BlockModel} from "../../services/block.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";
import {LearnplaceNavParams} from "../learnplace-tabs/learnplace.nav-params";

@Component({
    templateUrl: "content.html"
})
export class ContentPage implements ViewWillEnter, ViewDidEnter, ViewDidLeave {

    blockList: Observable<Array<BlockModel>> = NEVER;

    constructor(
        @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
        private readonly detectorRef: ChangeDetectorRef,
    ) { }

    ionViewWillEnter(): void {
        // we detect property changes, when a block list is emitted to update the UI with the new block list
        this.blockList = this.blockService.getBlockList(LearnplaceNavParams.learnplaceObjectId)
            .pipe(
                tap(() => this.detectorRef.detectChanges()),
                shareReplay(1)
            );
    }

    ionViewDidEnter(): void {
        this.detectorRef.detectChanges();
    }

    ionViewDidLeave(): void {
        this.blockService.shutdown();
    }
}
