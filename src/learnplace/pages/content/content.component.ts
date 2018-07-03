import {ChangeDetectorRef, Component, Inject, OnDestroy} from "@angular/core";
import {BlockModel} from "../../services/block.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";
import {AlertController, AlertOptions, NavParams} from "ionic-angular";
import {TranslateService} from "ng2-translate";
import {Observable} from "rxjs/Observable";

@Component({
    templateUrl: "content.html"
})
export class ContentPage implements OnDestroy {

    private readonly learnplaceId: number;
    readonly title: string;
    readonly blockList: Observable<Array<BlockModel>>;

    constructor(
        @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
        private readonly translate: TranslateService,
        private readonly alert: AlertController,
        private readonly detectorRef: ChangeDetectorRef,
        params: NavParams
    ) {
        this.learnplaceId = params.get("learnplaceId");
        this.title = params.get("learnplaceName");

        // we detect property changes, when a block list is emitted to update the UI with the new block list
        this.blockList = this.blockService.getBlockList(this.learnplaceId).do(_ => this.detectorRef.detectChanges());
    }

    ngOnDestroy(): void {
        this.blockService.shutdown();
    }
}

export interface ContentPageParams {
    readonly learnplaceId: number;
    readonly learnplaceName: string;
}
