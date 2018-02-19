import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import {useStandard} from "../standard";

useStandard();
platformBrowserDynamic().bootstrapModule(AppModule);
