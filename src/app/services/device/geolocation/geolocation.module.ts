import {NgModule} from "@angular/core";
import {Geolocation} from "./geolocation.service";

@NgModule({
    providers: [Geolocation]
})
export class GeolocationModule {}
