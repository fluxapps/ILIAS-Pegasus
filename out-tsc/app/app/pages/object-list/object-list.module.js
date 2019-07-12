var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** angular */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
/** misc */
import { ObjectListPage } from "./object-list";
import { TranslateModule } from "@ngx-translate/core";
var routes = [
    {
        path: "",
        component: ObjectListPage
    }
];
var ObjectListPageModule = /** @class */ (function () {
    function ObjectListPageModule() {
    }
    ObjectListPageModule = __decorate([
        NgModule({
            imports: [
                CommonModule,
                FormsModule,
                ReactiveFormsModule,
                IonicModule,
                TranslateModule,
                RouterModule.forChild(routes)
            ],
            declarations: [ObjectListPage]
        })
    ], ObjectListPageModule);
    return ObjectListPageModule;
}());
export { ObjectListPageModule };
//# sourceMappingURL=object-list.module.js.map