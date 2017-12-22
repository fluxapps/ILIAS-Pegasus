import {AfterViewInit, Component, Inject} from "@angular/core";
import {Nav, NavParams, ViewController} from "ionic-angular";
import {LEARNPLACE_LOADER, LearnplaceLoader} from "../../services/learnplace";
import {TabsPage} from "../tabs/tabs.component";


@Component({
  templateUrl: "learnplace.html"
})
export class LearnplacePage implements AfterViewInit {

  constructor(
    private readonly nav: Nav,
    private readonly navParams: NavParams,
    private readonly viewController: ViewController,
    @Inject(LEARNPLACE_LOADER) private readonly learnplaceLoader: LearnplaceLoader
  ) {}

  ngAfterViewInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    // TODO: get id from nav params
    await this.learnplaceLoader.load(1);
    await this.viewController.dismiss();
    await this.nav.push(TabsPage);
  }
}
