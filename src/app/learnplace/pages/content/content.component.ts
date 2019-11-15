import {ChangeDetectorRef, Component, Inject, OnDestroy} from "@angular/core";
import {BlockModel} from "../../services/block.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";
import {AlertController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs/Observable";
import {LearnplaceNavParams} from "../learnplace-tabs/learnplace.nav-params";

@Component({
    templateUrl: "content.html"
})
export class ContentPage implements OnDestroy {

    private learnplaceId: number;
    title: string;
    blockList: Observable<Array<BlockModel>>;

    constructor(
        @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
        private readonly translate: TranslateService,
        private readonly alert: AlertController,
        private readonly detectorRef: ChangeDetectorRef,
    ) { }

    ionViewWillEnter(): void {
        this.learnplaceId = LearnplaceNavParams.learnplaceObjectId;
        this.title = LearnplaceNavParams.learnplaceName;

        // we detect property changes, when a block list is emitted to update the UI with the new block list
        this.blockList = this.blockService.getBlockList(this.learnplaceId).do(_ => this.detectorRef.detectChanges());
    }

    ngOnDestroy(): void {
        this.blockService.shutdown();
    }
}
