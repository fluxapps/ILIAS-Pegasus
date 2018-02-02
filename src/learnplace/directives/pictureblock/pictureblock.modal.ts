import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";

@Component({
  templateUrl: "picture-block-modal.html"
})
export class PictureBlockModal {

  readonly imageUrl: string;

  constructor(
    private readonly viewController: ViewController,
    navParams: NavParams
  ) {
    this.imageUrl = navParams.get(NAV_PARAM_IMG_URL);
  }

  close(): void {
    this.viewController.dismiss();
  }
}

export const NAV_PARAM_IMG_URL: string = "imgUrl";
