import {enableProdMode} from "@angular/core";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app/app.module";
import {environment} from "./environments/environment";
import {useStandard} from "./standard";
// Required for typeorm library
// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";

if (environment.production) {
  enableProdMode();
}

useStandard();
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
