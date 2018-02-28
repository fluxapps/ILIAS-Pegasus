import {Component, Input} from "@angular/core";
import {VideoBlockModel} from "../../services/block.model";
import {Platform} from "ionic-angular";
import {File} from "@ionic-native/file";
import {StreamingMedia} from "@ionic-native/streaming-media";

@Component({
  selector: "video-block",
  templateUrl: "video-block.html"
})
export class VideoBlock {

  @Input("value")
  readonly videoBlock: VideoBlockModel;

  constructor(
    private readonly platform: Platform,
    private readonly file: File,
    private readonly streaming: StreamingMedia
  ) {}

  play(): void {
    this.streaming.playVideo(`${this.getStorageLocation()}${this.videoBlock.url}`);
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
