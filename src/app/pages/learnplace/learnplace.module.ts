import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeolocationModule } from "../../services/device/geolocation/geolocation.module";

import { IonicModule } from '@ionic/angular';

import { LearnplacePageRoutingModule } from './learnplace-routing.module';

import { LearnplacePage } from './learnplace.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LearnplacePageRoutingModule,
    GeolocationModule
  ],
  declarations: [LearnplacePage]
})
export class LearnplacePageModule {}
