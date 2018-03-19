import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {PictureBlockModel} from "../../services/block.model";
import {Platform} from "ionic-angular";
import {File} from "@ionic-native/file";
import {PhotoViewer, PhotoViewerOptions} from "@ionic-native/photo-viewer";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {isDefined} from "ionic-angular/es2015/util/util";

@Component({
  selector: "picture-block",
  templateUrl: "picture-block.html"
})
export class PictureBlock implements OnInit, OnDestroy {

  @Input("value")
  readonly observablePicture: Observable<PictureBlockModel>;

  pictureBlock: PictureBlockModel | undefined = undefined;

  embeddedSrc: SafeUrl | undefined = undefined;

  private pictureBlockSubscription: Subscription | undefined = undefined;

  private readonly log: Logger = Logging.getLogger(PictureBlock.name);

  constructor(
    private readonly platform: Platform,
    private readonly file: File,
    private readonly photoViewer: PhotoViewer,
    private readonly sanitizer: DomSanitizer,
    private readonly detectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.pictureBlockSubscription = this.observablePicture.subscribe(it => {
      this.pictureBlock = it;
      this.detectorRef.detectChanges();
    });

    // because the thumbnail is immutable, we only use the first picture block to encode it
    this.observablePicture.first().subscribe(it => {
      const fileName: string = it.thumbnail.split("/").pop();
      const path: string = it.thumbnail.replace(fileName, "");

      this.file.readAsDataURL(`${this.getStorageLocation()}${path}`, fileName).then(data => {
        this.embeddedSrc = this.sanitizer.bypassSecurityTrustUrl(data);
      }).catch(error => {
        this.log.warn(() => `Could not load thumbnail: url: ${it.thumbnail}`);
        this.log.debug(() => `Thumbnail load error: ${JSON.stringify(error)}`);
      });
    });
  }

  ngOnDestroy(): void {
    if(isDefined(this.pictureBlockSubscription))
      this.pictureBlockSubscription.unsubscribe();
  }

  show(): void {
    this.photoViewer.show(`${this.getStorageLocation()}${this.pictureBlock.url}`, this.pictureBlock.title, <PhotoViewerOptions>{share:false});
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
