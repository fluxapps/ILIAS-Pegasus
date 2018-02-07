import {AfterViewInit, Component, Inject} from "@angular/core";
import {Nav, NavParams, ViewController} from "ionic-angular";
import {LEARNPLACE_LOADER, LearnplaceLoader, MUT_LEARNPLACE, MutableLearnplaceData} from "../../services/loader/learnplace";
import {TabsPage} from "../tabs/tabs.component";


@Component({
  templateUrl: "learnplace.html"
})
export class LearnplacePage implements AfterViewInit {

  constructor(
    private readonly nav: Nav,
    private readonly navParams: NavParams,
    private readonly viewController: ViewController,
    @Inject(LEARNPLACE_LOADER) private readonly learnplaceLoader: LearnplaceLoader,
    @Inject(MUT_LEARNPLACE) private readonly learnplace: MutableLearnplaceData
  ) {}

  ngAfterViewInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    // TODO: get id and name from nav params
    await this.learnplaceLoader.load(1);

    this.learnplace.setId(1);
    this.learnplace.setName("Learnplace XY");

    await this.viewController.dismiss();
    await this.nav.push(TabsPage);
  }
}
