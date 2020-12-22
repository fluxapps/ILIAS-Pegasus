import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LearnplacePage } from './learnplace.page';

const routes: Routes = [
  {
    path: ':refId',
    component: LearnplacePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LearnplacePageRoutingModule {}
