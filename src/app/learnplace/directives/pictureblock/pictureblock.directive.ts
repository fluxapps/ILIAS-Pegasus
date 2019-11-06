import {Component, Inject, Input, OnInit} from "@angular/core";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {File} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Filesystem, FILESYSTEM_TOKEN} from "../../../services/filesystem";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {PictureBlockModel} from "../../services/block.model";

@Component({
    selector: "picture-block",
    templateUrl: "picture-block.html"
})
export class PictureBlock implements OnInit {

    @Input("value")
    readonly pictureBlock: PictureBlockModel;

    embeddedSrc?: SafeUrl;

    private readonly log: Logger = Logging.getLogger(PictureBlock.name);

    constructor(
        private readonly platform: Platform,
        private readonly file: File,
        @Inject(FILESYSTEM_TOKEN) private readonly filesystem: Filesystem,
        private readonly sanitizer: DomSanitizer
    ) {
    }

    async ngOnInit(): Promise<void> {

        const fileName: string = this.pictureBlock.thumbnail.split("/").pop();
        const path: string = this.pictureBlock.thumbnail.replace(fileName, "");

        this.file.readAsDataURL(`${this.getStorageLocation()}${path}`, fileName).then(data => {
            this.embeddedSrc = this.sanitizer.bypassSecurityTrustUrl(data);
        }).catch(error => {
            this.log.warn(() => `Could not load thumbnail: url: ${this.pictureBlock.thumbnail}`);
            this.log.debug(() => `Thumbnail load error: ${JSON.stringify(error)}`);
        });
    }

    async show(): Promise<void> {
        await this.filesystem.open(this.pictureBlock.url);
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
