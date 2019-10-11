import {enableProdMode} from "@angular/core";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app/app.module";
import {environment} from "./environments/environment";
import {useStandard} from "./standard";

if (environment.production) {
  enableProdMode();
}

useStandard();
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
