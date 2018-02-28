import {Component, Input, OnInit} from "@angular/core";
import {PictureBlockModel} from "../../services/block.model";
import {Platform} from "ionic-angular";
import {File} from "@ionic-native/file";
import {PhotoViewer} from "@ionic-native/photo-viewer";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";

@Component({
  selector: "picture-block",
  templateUrl: "picture-block.html"
})
export class PictureBlock implements OnInit {

  @Input("value")
  readonly picture: PictureBlockModel;

  embeddedSrc: SafeUrl | undefined = undefined;

  private readonly log: Logger = Logging.getLogger(PictureBlock.name);

  constructor(
    private readonly platform: Platform,
    private readonly file: File,
    private readonly photoViewer: PhotoViewer,
    private readonly sanitizer: DomSanitizer
  ) {}


  ngOnInit(): void {

    const fileName: string = this.picture.thumbnail.split("/").pop();
    const path: string = this.picture.thumbnail.replace(fileName, "");

    this.file.readAsDataURL(`${this.getStorageLocation()}${path}`, fileName).then(data => {
      this.embeddedSrc = this.sanitizer.bypassSecurityTrustUrl(data);
    }).catch(error => {
      this.log.warn(() => `Could not load thumbnail: url: ${this.picture.thumbnail}`);
      this.log.debug(() => `Thumbnail load error: ${JSON.stringify(error)}`);
    });
  }

  show(): void {
    this.photoViewer.show(`${this.getStorageLocation()}${this.picture.url}`, this.picture.title);
  }

  private getStorageLocation(): string {
    if (this.platform.is("android")) {
      return this.file.externalApplicationStorageDirectory;
    }
    if (this.platform.is("ios")) {
      return this.file.dataDirectory;
    }

    throw new Error("Unsupported platform. Can not return a storage location.");
  }
}
