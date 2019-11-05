import {NgModule} from "@angular/core";
import {FileOpener} from "@ionic-native/file-opener";
import {File} from "@ionic-native/file";
import {CORDOVA_FILESYSTEM_FACTORY} from "./filesystem.cordova";
import {FILESYSTEM_TOKEN} from "./filesystem.service";
import { Platform } from "@ionic/angular";

@NgModule({
    providers: [
        {
            provide: FILESYSTEM_TOKEN,
            useFactory: CORDOVA_FILESYSTEM_FACTORY,
            deps: [Platform, File, FileOpener]
        },
    ]
})
export class FilesystemModule {}
