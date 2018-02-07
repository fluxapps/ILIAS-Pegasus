import {Component, Input} from "@angular/core";
import {PictureBlockModel} from "../../services/block.model";
import {ModalController} from "ionic-angular";
import {PictureBlockModal, PictureBlockModalParams} from "./pictureblock.modal";

@Component({
  selector: "picture-block",
  templateUrl: "picture-block.html"
})
export class PictureBlock {

  @Input("value")
  readonly picture: PictureBlockModel;

  constructor(
    private readonly modalController: ModalController
  ) {}

  show(): void {
    this.modalController.create(PictureBlockModal, <PictureBlockModalParams>{imgUrl: this.picture.url})
      .present()
  }
}
