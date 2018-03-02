import {AfterViewInit, Component, Inject} from "@angular/core";
import {BlockModel} from "../../services/block.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";
import {AlertController, AlertOptions, NavParams} from "ionic-angular";
import {AlertButton} from "ionic-angular/components/alert/alert-options";
import {TranslateService} from "ng2-translate";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";

@Component({
  templateUrl: "content.html"
})
export class ContentPage implements AfterViewInit {

  private readonly learnplaceId: number;
  readonly title: string;
  readonly blockList: Array<BlockModel> = [];

  private readonly log: Logger = Logging.getLogger(ContentPage.name);

  constructor(
    @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
    private readonly translate: TranslateService,
    private readonly alert: AlertController,
    params: NavParams
  ) {
    this.learnplaceId = params.get("learnplaceId");
    this.title = params.get("learnplaceName");
  }

  ngAfterViewInit(): void {
    this.blockService.getBlocks(this.learnplaceId)
      .then(blocks => this.blockList.push(...blocks))
      .catch(error => {
        this.log.warn(() => `Could not load content: error=${JSON.stringify(error)}`);
        this.showAlert(this.translate.instant("something_went_wrong"));
      });
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

export interface ContentPageParams {
  readonly learnplaceId: number;
  readonly learnplaceName: string;
}
