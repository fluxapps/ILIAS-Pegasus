import {enableProdMode} from "@angular/core";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app/app.module";
import {environment} from "./environments/environment";
import {useStandard} from "./standard";
// Required for typeorm library
// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";

if (window.isSecureContext !== true) {
    const errorMessage: string = "The ILIAS Pegasus App needs a secure context! " +
        "Make sure this app is served over https://, file:// or http://localhost";
    throw new Error(errorMessage);
}

if (environment.production) {
  enableProdMode();
}

useStandard();
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
